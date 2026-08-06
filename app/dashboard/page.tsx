'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { dashboardSections, integrationCards, pricingPlans } from '../product-data';

type Overview = {
  subscribers?: number;
  active_devices?: number;
  new_subscriptions?: number;
  sent_pushes?: number;
  opens?: number;
  site_status?: string | null;
};

type Subscriber = {
  id: string;
  anonymous_id?: string | null;
  external_customer_id?: string | null;
  external_source?: string | null;
  status?: string | null;
  platform?: string | null;
  browser?: string | null;
  os?: string | null;
  permission?: string | null;
  subscription_status?: string | null;
  last_seen_at?: string | null;
};

type SubscribersResponse = {
  subscribers?: Subscriber[];
};

type TestConfig = {
  projectId: string;
  publicKey: string;
  serviceWorkerPath: string;
};

type ProjectMode = 'test' | 'production';

type TrialProject = {
  label: string;
  siteUrl?: string;
  organizationId: string;
  projectId: string;
  apiKey: string;
  trialEndsAt: string;
};

const TRIAL_PROJECT_STORAGE_KEY = 'pushgiant.trialProject.v1';

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [sendMessage, setSendMessage] = useState<string | null>(null);
  const [testState, setTestState] = useState<'idle' | 'requesting' | 'sending' | 'reset' | 'failed'>('idle');
  const [testMessage, setTestMessage] = useState<string | null>(null);
  const [isStandalonePwa, setIsStandalonePwa] = useState(false);
  const [pwaModeChecked, setPwaModeChecked] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [projectMode, setProjectMode] = useState<ProjectMode>('test');
  const [trialProject, setTrialProject] = useState<TrialProject | null>(null);

  useEffect(() => {
    const storedProject = readStoredTrialProject();
    setTrialProject(storedProject);

    if (storedProject && new URLSearchParams(window.location.search).get('project') === 'production') {
      setProjectMode('production');
    }
  }, []);

  const activeProject = projectMode === 'production' && trialProject ? trialProject : null;
  const projectHeaders = useMemo(() => {
    if (!activeProject) return undefined;

    return {
      'x-pushgiant-project-id': activeProject.projectId,
      'x-pushgiant-api-key': activeProject.apiKey
    };
  }, [activeProject]);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [overviewResponse, subscribersResponse] = await Promise.all([
          fetch('/api/platform/overview', { cache: 'no-store', headers: projectHeaders }),
          fetch('/api/platform/subscribers', { cache: 'no-store', headers: projectHeaders })
        ]);

        if (!overviewResponse.ok) {
          const body = await overviewResponse.json().catch(() => ({}));
          throw new Error(body.error ?? `overview_failed_${overviewResponse.status}`);
        }

        if (!subscribersResponse.ok) {
          const body = await subscribersResponse.json().catch(() => ({}));
          throw new Error(body.error ?? `subscribers_failed_${subscribersResponse.status}`);
        }

        const overviewData = await overviewResponse.json() as Overview;
        const subscribersData = await subscribersResponse.json() as SubscribersResponse;

        if (!ignore) {
          setOverview(overviewData);
          setSubscribers(subscribersData.subscribers ?? []);
        }
      } catch (loadError) {
        if (!ignore) {
          setError(loadError instanceof Error ? loadError.message : 'dashboard_load_failed');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      ignore = true;
    };
  }, [projectHeaders]);

  useEffect(() => {
    const displayModeQueries = [
      window.matchMedia('(display-mode: standalone)'),
      window.matchMedia('(display-mode: fullscreen)'),
      window.matchMedia('(display-mode: minimal-ui)')
    ];
    const updatePwaMode = () => {
      setIsStandalonePwa(isRunningAsInstalledPwa());
      setPwaModeChecked(true);
    };

    updatePwaMode();
    displayModeQueries.forEach((query) => query.addEventListener('change', updatePwaMode));
    window.addEventListener('focus', updatePwaMode);
    document.addEventListener('visibilitychange', updatePwaMode);

    return () => {
      displayModeQueries.forEach((query) => query.removeEventListener('change', updatePwaMode));
      window.removeEventListener('focus', updatePwaMode);
      document.removeEventListener('visibilitychange', updatePwaMode);
    };
  }, []);

  const metrics = useMemo(() => [
    ['Подписчики', formatNumber(overview?.subscribers), 'all time'],
    ['Активные устройства', formatNumber(overview?.active_devices), 'active push endpoints'],
    ['Новые подписки', formatNumber(overview?.new_subscriptions), 'last 24 hours'],
    ['Отправлено push', formatNumber(overview?.sent_pushes), 'sent delivery attempts'],
    ['Открытия', formatNumber(overview?.opens), 'tracked push.open'],
    ['Статус сайта', overview?.site_status ?? 'pending', 'domain verification']
  ], [overview]);

  const activeProjectLabel = activeProject?.label || 'Push Giant test';
  const activeProjectNote = activeProject
    ? `${activeProject.siteUrl || 'trial project'} · trial до ${formatDate(activeProject.trialEndsAt)}`
    : 'safe demo project';

  function chooseProject(nextMode: ProjectMode) {
    if (nextMode === 'production' && !trialProject) {
      setProjectMode('test');
      setError('Сначала создайте trial-проект, потом кабинет сможет переключиться на Client production.');
      return;
    }

    setProjectMode(nextMode);
    setSendMessage(null);
    setError(null);
  }

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSendState('sending');
    setSendMessage(null);

    const response = await fetch('/api/platform/campaigns/send-now', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...projectHeaders
      },
      body: JSON.stringify({
        title: form.get('title'),
        body: form.get('body'),
        url: form.get('url')
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSendState('failed');
      setSendMessage(readPlatformError(data, `send_failed_${response.status}`));
      return;
    }

    setSendState('sent');
    setSendMessage(`Кампания поставлена в очередь: ${data.id ?? 'accepted'}`);
    event.currentTarget.reset();
  }

  function openConsentStep() {
    setTestMessage(null);

    if (!isRunningAsInstalledPwa()) {
      setIsStandalonePwa(false);
      setPwaModeChecked(true);
      setTestState('failed');
      setTestMessage('Сначала добавьте сайт на экран Домой и откройте Push Giant с иконки. Потом тестовый push будет честно проверять PWA, а не вкладку браузера.');
      return;
    }

    setShowConsent(true);
    setTestState('idle');
  }

  async function runOneShotTest() {
    let subscription: PushSubscription | null = null;

    setTestState('requesting');
    setTestMessage('Проверяем, что тест открыт из PWA на экране Домой...');

    try {
      if (!isRunningAsInstalledPwa()) {
        setIsStandalonePwa(false);
        setPwaModeChecked(true);
        setTestState('failed');
        setTestMessage('Сначала добавьте сайт на экран Домой и откройте Push Giant с иконки. Потом тестовый push будет честно проверять PWA, а не вкладку браузера.');
        return;
      }

      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        throw new Error('Этот браузер не поддерживает Web Push.');
      }

      setTestMessage('Запрашиваем разрешение и готовим временную подписку...');
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setTestState('failed');
        setTestMessage(permission === 'denied'
          ? 'Уведомления заблокированы в браузере. Разрешение нужно включить в настройках сайта.'
          : 'Разрешение на уведомления не выдано.');
        return;
      }

      const configResponse = await fetch('/api/platform/test/config', { cache: 'no-store' });
      const config = await configResponse.json().catch(() => ({})) as Partial<TestConfig>;
      if (!configResponse.ok || !config.publicKey || !config.serviceWorkerPath) {
        throw new Error(configResponse.ok ? 'test_config_missing' : `test_config_failed_${configResponse.status}`);
      }

      const registration = await navigator.serviceWorker.register(config.serviceWorkerPath);
      subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(config.publicKey)
        });
      }

      const anonymousId = `pg_test_${crypto.randomUUID().replace(/-/g, '')}`;
      setTestState('sending');
      setTestMessage('Отправляем один push только на это устройство...');

      const sendResponse = await fetch('/api/platform/test/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          anonymousId,
          subscription: subscription.toJSON(),
          title: 'Push Giant работает',
          body: 'Это тестовое уведомление. Подписка уже сброшена, повторной рассылки не будет.',
          url: new URL('/', window.location.origin).toString(),
          platform: navigator.platform,
          browser: detectBrowser(navigator.userAgent),
          userAgent: navigator.userAgent,
          locale: navigator.language,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          permission: Notification.permission
        })
      });
      const sendData = await sendResponse.json().catch(() => ({}));

      if (!sendResponse.ok) {
        throw new Error(readPlatformError(sendData, `test_send_failed_${sendResponse.status}`));
      }

      await subscription.unsubscribe().catch(() => false);
      setTestState('reset');
      setTestMessage('Тестовый push отправлен. Временная подписка сброшена на сервере и в браузере.');
    } catch (testError) {
      if (subscription) {
        await subscription.unsubscribe().catch(() => false);
      }

      setTestState('failed');
      setTestMessage(testError instanceof Error ? testError.message : 'test_send_failed');
    }
  }

  return (
    <main className="dashboard">
      <aside>
        <a className="logo" href="/">Push Giant</a>
        <nav>{dashboardSections.map((item) => <a href={`#${item}`} key={item}>{item}</a>)}</nav>
        <div className="project">
          <span>Project</span>
          <strong>{activeProjectLabel}</strong>
          <small>{loading ? 'loading API' : error ? 'API attention needed' : activeProjectNote}</small>
        </div>
      </aside>

      <section className="content">
        <div className="topline">
          <div>
            <p>Control project</p>
            <h1>Push Giant dashboard</h1>
          </div>
          <a href="/downloads/pushgiant-wordpress.zip">Download WordPress plugin</a>
        </div>

        {error ? (
          <section className="alert">
            <strong>API не готов</strong>
            <span>{error}</span>
          </section>
        ) : null}

        <section className="panel projectMode">
          <div>
            <p className="eyebrow">Project model</p>
            <h2>Два сценария в одном кабинете</h2>
          </div>
          <div className="projectCards">
            <article className={projectMode === 'test' ? 'activeProject' : ''}>
              <span>{projectMode === 'test' ? 'активно сейчас' : 'safe demo'}</span>
              <strong>Push Giant test</strong>
              <small>Безопасный self-test: временная `pg_test_*` подписка, один push, затем сброс.</small>
              <button type="button" onClick={() => chooseProject('test')}>Выбрать test</button>
            </article>
            <article className={projectMode === 'production' ? 'activeProject' : ''}>
              <span>{projectMode === 'production' ? 'активно сейчас' : 'trial project'}</span>
              <strong>{trialProject?.label || 'Client production'}</strong>
              <small>
                {trialProject
                  ? `${trialProject.siteUrl || 'Боевой сайт клиента'} · API key сохранён после регистрации trial.`
                  : 'Создайте trial, чтобы получить проект, API key и отдельный production-контекст.'}
              </small>
              {trialProject ? (
                <button type="button" onClick={() => chooseProject('production')}>Выбрать production</button>
              ) : (
                <a href="/register">Создать trial</a>
              )}
            </article>
          </div>
        </section>

        <section id="Обзор" className="panel overview">
          <h2>Обзор</h2>
          <div className="metrics">
            {metrics.map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{loading ? '...' : value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>
        </section>

        <section className="panel installGuide">
          <div>
            <p className="eyebrow">Install flow</p>
            <h2>Как проверить PWA на телефоне</h2>
            <p>
              Откройте сайт с телефона, добавьте Push Giant на экран Домой и вернитесь в кабинет уже из иконки.
              На iPhone push не тестируется из обычной Safari-вкладки.
            </p>
          </div>
          <div className="guideSteps">
            <article>
              <span>iPhone</span>
              <strong>Поделиться, затем На экран Домой</strong>
              <small>После добавления закройте Safari и откройте Push Giant с новой иконки.</small>
            </article>
            <article>
              <span>Android</span>
              <strong>Меню браузера, затем Установить приложение</strong>
              <small>Если браузер покажет install prompt, подтвердите установку и откройте PWA.</small>
            </article>
            <article>
              <span>Permission</span>
              <strong>Согласие, системный popup, push</strong>
              <small>Сначала показываем текст согласия, затем браузерный запрос на уведомления.</small>
            </article>
          </div>
        </section>

        <section className="panel split testPanel">
          <div>
            <p className="eyebrow">Test project</p>
            <h2>Проверить push на себе</h2>
            <p>
              Кабинет работает только из PWA, открытого с экрана Домой: создаёт временную подписку,
              отправляет один тестовый push и сразу сбрасывает её на сервере и устройстве.
            </p>
            {!isStandalonePwa && pwaModeChecked ? (
              <div className="installNotice">
                Добавьте сайт на экран Домой и откройте приложение с иконки, чтобы включить тест.
              </div>
            ) : null}
            {testMessage ? <div className={`send ${testState === 'failed' ? 'failed' : 'sent'}`}>{testMessage}</div> : null}
          </div>
          <div className="testBox">
            <span>one-shot</span>
            <strong>1 push</strong>
            <small>{isStandalonePwa ? 'без сохранения активной тестовой аудитории' : 'сначала запуск с экрана Домой'}</small>
            <button
              type="button"
              onClick={openConsentStep}
              disabled={!isStandalonePwa || showConsent || testState === 'requesting' || testState === 'sending'}
            >
              {!isStandalonePwa
                ? 'Откройте PWA'
                : showConsent
                  ? 'Подтвердите согласие'
                : testState === 'requesting'
                  ? 'Готовим...'
                  : testState === 'sending'
                    ? 'Отправляем...'
                    : 'Отправить себе тест'}
            </button>
          </div>
        </section>

        <section id="Подписчики" className="panel">
          <h2>Подписчики</h2>
          <div className="table">
            {['ID / CRM', 'Device', 'Browser', 'Permission', 'Status'].map((cell) => (
              <span className="head" key={cell}>{cell}</span>
            ))}
            {subscribers.length > 0 ? subscribers.map((subscriber) => (
              <SubscriberRow key={subscriber.id} subscriber={subscriber} />
            )) : (
              <span className="empty">Пока нет живых подписчиков. Первый тест с телефона появится здесь.</span>
            )}
          </div>
        </section>

        <section id="Рассылки" className="panel split">
          <div>
            <h2>Рассылки</h2>
            <p>
              Создаёт кампанию в API и сразу ставит её в очередь BullMQ для отправки.
              Сейчас активен проект: {activeProjectLabel}.
            </p>
            {sendMessage ? <div className={`send ${sendState}`}>{sendMessage}</div> : null}
          </div>
          <form onSubmit={sendCampaign}>
            <input name="title" placeholder="Заголовок push" required maxLength={120} />
            <textarea name="body" placeholder="Текст уведомления" required maxLength={240} />
            <input name="url" type="url" placeholder="https://example.com/new/" />
            <button disabled={sendState === 'sending'} type="submit">
              {sendState === 'sending' ? 'Отправляем...' : 'Отправить сейчас'}
            </button>
          </form>
        </section>

        <section id="PWA" className="panel split">
          <div>
            <h2>PWA</h2>
            <p>Название, иконка, цвет, start URL, manifest, service worker и инструкция установки для активного проекта.</p>
          </div>
          <div className="phone">
            <span>{projectMode === 'production' ? 'Client production' : 'Demo project'}</span>
            <strong>Add to Home Screen</strong>
            <small>{activeProject?.siteUrl || 'manifest + service worker pilot'}</small>
          </div>
        </section>

        <section id="Сегменты" className="panel cards">
          <h2>Сегменты</h2>
          {[
            ['Все активные', 'Подписчики с active endpoint'],
            ['Новые 7 дней', 'last_seen_at за последнюю неделю'],
            ['Тестовая группа', 'ручной сегмент для первого запуска']
          ].map(([title, note]) => (
            <article key={title}>
              <strong>{title}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>

        <section id="Геопуш" className="panel split">
          <div>
            <h2>Геопуш</h2>
            <p>Работает по последней явной геопозиции пользователя: город, радиус, срок актуальности, согласие на геоданные.</p>
          </div>
          <div className="geoBox">
            <strong>Не фоновый geofence</strong>
            <span>PWA не отслеживает iOS в фоне. В MVP честно используем last-known location.</span>
          </div>
        </section>

        <section id="Интеграции" className="panel cards">
          <h2>Интеграции</h2>
          {integrationCards.map(([name, status, text]) => (
            <article key={name}>
              <strong>{name}</strong>
              <small>{status} · {text}</small>
            </article>
          ))}
        </section>

        <section id="Аналитика" className="panel cards">
          <h2>Аналитика</h2>
          {[
            ['Accepted', 'кампания принята API'],
            ['Sent / failed', 'delivery_attempts от worker'],
            ['Clicked', 'push.open events из service worker']
          ].map(([title, note]) => (
            <article key={title}>
              <strong>{title}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>

        <section id="Тариф" className="panel cards">
          <h2>Тариф</h2>
          {pricingPlans.slice(0, 3).map((plan) => (
            <article key={plan.name}>
              <strong>{plan.name}: {plan.price}</strong>
              <small>{plan.note}</small>
            </article>
          ))}
        </section>

        <section id="Команда" className="panel cards">
          <h2>Команда</h2>
          {['Owner', 'Admin', 'Marketer'].map((role) => (
            <article key={role}>
              <strong>{role}</strong>
              <small>{role === 'Owner' ? 'создаётся при регистрации trial' : 'роль заложена в модели organization_members'}</small>
            </article>
          ))}
        </section>

        <section id="Настройки" className="panel split">
          <div>
            <h2>Настройки</h2>
            <p>Project ID, API key, домены, VAPID, trial и диагностика подключения сайта.</p>
          </div>
          <code>{activeProject
            ? `Project ID: ${activeProject.projectId}\nAPI key: ${maskApiKey(activeProject.apiKey)}\nTrial ends: ${formatDate(activeProject.trialEndsAt)}`
            : 'API key hidden in server env'}</code>
        </section>
      </section>

      {showConsent ? (
        <div className="consentOverlay" role="dialog" aria-modal="true" aria-labelledby="push-consent-title">
          <section className="consentModal">
            <p className="eyebrow">Consent</p>
            <h2 id="push-consent-title">Согласие на тестовое уведомление</h2>
            <p>
              Вы разрешаете Push Giant отправить одно тестовое push-уведомление на это устройство,
              чтобы проверить работу установленного PWA. Подписка создаётся только для проверки,
              не попадает в боевую аудиторию и будет сброшена сразу после отправки.
            </p>
            <div className="consentActions">
              <button type="button" onClick={() => setShowConsent(false)}>Отмена</button>
              <button type="button" onClick={() => { setShowConsent(false); void runOneShotTest(); }}>
                Согласен, показать системный запрос
              </button>
            </div>
          </section>
        </div>
      ) : null}

      <style jsx>{`
        .dashboard{min-height:100svh;display:grid;grid-template-columns:260px 1fr;background:#f4f1ec;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}
        aside{position:sticky;top:0;height:100svh;padding:28px 22px;background:#17130f;color:#f8f3ea;display:flex;flex-direction:column}
        .logo{font-family:var(--font-display),Georgia,serif;font-size:25px;margin-bottom:42px}
        nav{display:grid;gap:6px}
        nav a{padding:11px 12px;border-radius:6px;color:#d9cbb8}
        nav a:hover{background:rgba(255,255,255,.08);color:#fff}
        .project{margin-top:auto;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:8px;display:grid;gap:4px}
        .project span,.topline p{margin:0;text-transform:uppercase;letter-spacing:.18em;font-size:10px;color:#a98d66}
        .project small{color:#bdb0a0}
        .content{padding:34px clamp(20px,4vw,52px) 72px}
        .topline{display:flex;align-items:flex-start;justify-content:space-between;gap:24px;margin-bottom:28px}
        h1{margin:6px 0 0;font-family:var(--font-display),Georgia,serif;font-weight:400;font-size:clamp(38px,6vw,72px);line-height:.95}
        .topline a,button{border:1px solid #17130f;background:#17130f;color:#fff;border-radius:6px;padding:12px 15px;font-size:12px}
        button:disabled{opacity:.55;cursor:wait}
        .panel,.alert{background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:24px;margin-bottom:16px}
        .alert{border-color:#b4513a;background:#fff4ed;display:grid;gap:6px}
        .alert strong{font-size:18px}
        .alert span{color:#7c3f31}
        .eyebrow{margin:0 0 8px;text-transform:uppercase;letter-spacing:.18em;font-size:10px;color:#a98d66}
        h2{margin:0 0 18px;font-family:var(--font-display),Georgia,serif;font-weight:400;font-size:34px}
        .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .projectMode{display:grid;grid-template-columns:minmax(220px,.65fr) 1fr;gap:18px;align-items:start}
        .projectCards,.guideSteps{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .projectCards{grid-template-columns:1fr 1fr}
        .projectCards article,.guideSteps article{min-height:150px}
        .projectCards span,.guideSteps span{text-transform:uppercase;letter-spacing:.16em;font-size:10px;color:#a98d66}
        .projectCards strong,.guideSteps strong{font-size:24px;line-height:1.05}
        .projectCards button,.projectCards a{display:inline-flex;width:max-content;margin-top:14px;border-radius:6px;padding:10px 12px;border:1px solid #17130f;background:#17130f;color:#fff;font-size:12px}
        .activeProject{border-color:rgba(169,141,102,.6);box-shadow:inset 0 0 0 1px rgba(169,141,102,.18)}
        article{border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:16px;background:#fff}
        article span{display:block;font-size:12px;color:#7b6d5e}
        article strong{display:block;margin-top:10px;font-size:28px;font-weight:500}
        article small{display:block;margin-top:6px;color:#8a7b69}
        .table{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1.4fr;border:1px solid rgba(21,18,15,.1);border-radius:8px;overflow:hidden}
        .table span{padding:13px;background:#fff;border-right:1px solid rgba(21,18,15,.08);border-bottom:1px solid rgba(21,18,15,.08);font-size:13px}
        .table .head{background:#eee6da;text-transform:uppercase;letter-spacing:.12em;font-size:10px;color:#6f5d49}
        .table .empty{grid-column:1/-1;color:#6f5d49}
        .split{display:grid;grid-template-columns:1fr minmax(260px,.8fr);gap:24px;align-items:start}
        .split p{margin:0;color:#62574c;line-height:1.55}
        .testPanel{border-color:rgba(169,141,102,.34);background:#fff7eb}
        .testBox{border-radius:18px;background:#17130f;color:#fff;min-height:220px;padding:22px;display:grid;align-content:end;gap:8px}
        .testBox span{color:#c9ad80;text-transform:uppercase;letter-spacing:.16em;font-size:10px}
        .testBox strong{font-family:var(--font-display),Georgia,serif;font-size:46px;font-weight:400;line-height:1}
        .testBox small{color:#cfc5b8;margin-bottom:8px}
        .testBox button{background:#f8f3ea;color:#17130f;border-color:#f8f3ea}
        .installNotice{margin-top:16px;border:1px solid rgba(169,141,102,.35);border-radius:8px;padding:12px;background:#fffaf3;color:#6d5638;line-height:1.45}
        .send{margin-top:16px;border-radius:8px;padding:12px;background:#f0eadf;color:#4d4338}
        .send.sent{background:#e6f3e8;color:#285634}
        .send.failed{background:#fff0ea;color:#873c2c}
        .installGuide{display:grid;gap:18px}
        .installGuide p{margin:0;color:#62574c;line-height:1.55}
        form{display:grid;gap:10px}
        input,textarea{border:1px solid rgba(21,18,15,.15);background:#fff;border-radius:6px;padding:12px;font:14px inherit}
        textarea{min-height:96px;resize:vertical}
        .phone{border-radius:28px;background:#17130f;color:#fff;min-height:230px;padding:24px;display:flex;flex-direction:column;justify-content:flex-end}
        .phone span{color:#c9ad80;text-transform:uppercase;letter-spacing:.16em;font-size:10px}
        .phone strong{font-size:28px;line-height:1;margin:8px 0}
        .phone small{color:#cfc5b8}
        .geoBox{border-radius:18px;background:#17130f;color:#fff;min-height:180px;padding:22px;display:flex;flex-direction:column;justify-content:flex-end}
        .geoBox strong{font-size:26px;font-weight:500;line-height:1}
        .geoBox span{display:block;margin-top:10px;color:#cfc5b8;line-height:1.45}
        .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .cards h2{grid-column:1/-1}
        code{display:block;background:#17130f;color:#f8f3ea;border-radius:8px;padding:18px;white-space:pre-wrap}
        .consentOverlay{position:fixed;inset:0;z-index:50;background:rgba(12,10,8,.62);display:grid;place-items:center;padding:18px}
        .consentModal{width:min(560px,100%);background:#fffaf3;color:#15120f;border-radius:8px;padding:24px;box-shadow:0 24px 80px rgba(0,0,0,.28)}
        .consentModal h2{font-size:38px}
        .consentModal p:not(.eyebrow){margin:0;color:#62574c;line-height:1.58}
        .consentActions{display:flex;flex-wrap:wrap;gap:10px;justify-content:flex-end;margin-top:22px}
        .consentActions button:first-child{background:#fffaf3;color:#17130f;border-color:rgba(21,18,15,.22)}
        @media(max-width:880px){.dashboard{grid-template-columns:1fr}aside{position:static;height:auto}.metrics,.cards,.split,.projectMode,.projectCards,.guideSteps{grid-template-columns:1fr}.table{grid-template-columns:1fr}.table span{border-right:0}.topline{display:grid}}
      `}</style>
    </main>
  );
}

function SubscriberRow({ subscriber }: { subscriber: Subscriber }) {
  return (
    <>
      <span>{subscriber.external_customer_id ?? subscriber.anonymous_id ?? subscriber.id}</span>
      <span>{subscriber.platform ?? subscriber.os ?? 'unknown'}</span>
      <span>{subscriber.browser ?? 'unknown'}</span>
      <span>{subscriber.permission ?? 'default'}</span>
      <span>{subscriber.subscription_status ?? subscriber.status ?? 'unknown'}</span>
    </>
  );
}

function formatNumber(value?: number) {
  if (typeof value !== 'number') return '0';
  return new Intl.NumberFormat('ru-RU').format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('ru-RU');
}

function maskApiKey(value: string) {
  if (value.length <= 12) return 'hidden';
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

function readStoredTrialProject(): TrialProject | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(TRIAL_PROJECT_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<TrialProject>;
    if (!parsed.projectId || !parsed.apiKey || !parsed.organizationId || !parsed.trialEndsAt) {
      return null;
    }

    return {
      label: parsed.label || 'Client production',
      siteUrl: parsed.siteUrl,
      organizationId: parsed.organizationId,
      projectId: parsed.projectId,
      apiKey: parsed.apiKey,
      trialEndsAt: parsed.trialEndsAt
    };
  } catch {
    return null;
  }
}

function readPlatformError(data: unknown, fallback: string) {
  if (!data || typeof data !== 'object') return fallback;
  const payload = data as {
    error?: unknown;
    message?: unknown;
    status?: unknown;
    detail?: {
      error?: unknown;
      message?: unknown;
      status?: unknown;
      provider_status_code?: unknown;
    };
  };
  const detail = payload.detail && typeof payload.detail === 'object' ? payload.detail : null;
  const providerStatus = detail?.provider_status_code ? ` provider=${detail.provider_status_code}` : '';
  const message = detail?.message ?? detail?.error ?? payload.message ?? payload.error;
  const status = detail?.status ?? payload.status;

  if (typeof message === 'string') {
    return status ? `${message} (${status}${providerStatus})` : `${message}${providerStatus}`;
  }

  if (typeof payload.error === 'string') {
    return status ? `${payload.error} (${status}${providerStatus})` : `${payload.error}${providerStatus}`;
  }

  return fallback;
}

function detectBrowser(userAgent: string) {
  if (/Edg\//.test(userAgent)) return 'Edge';
  if (/Chrome\//.test(userAgent) && !/Edg\//.test(userAgent)) return 'Chrome';
  if (/Safari\//.test(userAgent) && !/Chrome\//.test(userAgent)) return 'Safari';
  if (/Firefox\//.test(userAgent)) return 'Firefox';
  return 'unknown';
}

function isRunningAsInstalledPwa() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean };
  return navigatorWithStandalone.standalone === true
    || window.matchMedia('(display-mode: standalone)').matches
    || window.matchMedia('(display-mode: fullscreen)').matches
    || window.matchMedia('(display-mode: minimal-ui)').matches;
}

function urlBase64ToUint8Array(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(Array.from(raw, (char) => char.charCodeAt(0)));
}
