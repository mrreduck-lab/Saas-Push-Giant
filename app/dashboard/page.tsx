'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';

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

const nav = ['Обзор', 'Подписчики', 'Рассылки', 'PWA', 'Интеграции', 'Настройки'];

export default function DashboardPage() {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sendState, setSendState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [sendMessage, setSendMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadDashboard() {
      setLoading(true);
      setError(null);

      try {
        const [overviewResponse, subscribersResponse] = await Promise.all([
          fetch('/api/platform/overview', { cache: 'no-store' }),
          fetch('/api/platform/subscribers', { cache: 'no-store' })
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
  }, []);

  const metrics = useMemo(() => [
    ['Подписчики', formatNumber(overview?.subscribers), 'all time'],
    ['Активные устройства', formatNumber(overview?.active_devices), 'active push endpoints'],
    ['Новые подписки', formatNumber(overview?.new_subscriptions), 'last 24 hours'],
    ['Отправлено push', formatNumber(overview?.sent_pushes), 'sent delivery attempts'],
    ['Открытия', formatNumber(overview?.opens), 'tracked push.open'],
    ['Статус сайта', overview?.site_status ?? 'pending', 'domain verification']
  ], [overview]);

  async function sendCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);

    setSendState('sending');
    setSendMessage(null);

    const response = await fetch('/api/platform/campaigns/send-now', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.get('title'),
        body: form.get('body'),
        url: form.get('url')
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setSendState('failed');
      setSendMessage(data.error ?? `send_failed_${response.status}`);
      return;
    }

    setSendState('sent');
    setSendMessage(`Кампания поставлена в очередь: ${data.id ?? 'accepted'}`);
    event.currentTarget.reset();
  }

  return (
    <main className="dashboard">
      <aside>
        <a className="logo" href="/">Push Giant</a>
        <nav>{nav.map((item) => <a href={`#${item}`} key={item}>{item}</a>)}</nav>
        <div className="project">
          <span>Project</span>
          <strong>Raschini</strong>
          <small>{loading ? 'loading API' : error ? 'API attention needed' : 'live API connected'}</small>
        </div>
      </aside>

      <section className="content">
        <div className="topline">
          <div>
            <p>Control project</p>
            <h1>Raschini pilot dashboard</h1>
          </div>
          <a href="/api/platform/wordpress-plugin">Download WordPress plugin</a>
        </div>

        {error ? (
          <section className="alert">
            <strong>API не готов</strong>
            <span>{error}</span>
          </section>
        ) : null}

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
            <p>Создаёт кампанию в API и сразу ставит её в очередь BullMQ для отправки.</p>
            {sendMessage ? <div className={`send ${sendState}`}>{sendMessage}</div> : null}
          </div>
          <form onSubmit={sendCampaign}>
            <input name="title" placeholder="Заголовок push" required maxLength={120} />
            <textarea name="body" placeholder="Текст уведомления" required maxLength={240} />
            <input name="url" type="url" placeholder="https://raschini.com/new/" />
            <button disabled={sendState === 'sending'} type="submit">
              {sendState === 'sending' ? 'Отправляем...' : 'Отправить сейчас'}
            </button>
          </form>
        </section>

        <section id="PWA" className="panel split">
          <div>
            <h2>PWA</h2>
            <p>Название, иконка, цвет, start URL, manifest, service worker и инструкция установки.</p>
          </div>
          <div className="phone">
            <span>Raschini</span>
            <strong>Add to Home Screen</strong>
            <small>manifest + service worker pilot</small>
          </div>
        </section>

        <section id="Интеграции" className="panel cards">
          <h2>Интеграции</h2>
          {['WordPress', 'Bitrix', 'Universal JS'].map((item) => (
            <article key={item}>
              <strong>{item}</strong>
              <small>{item === 'WordPress' ? 'Raschini pilot connector' : 'planned for pilot flow'}</small>
            </article>
          ))}
        </section>

        <section id="Настройки" className="panel split">
          <div>
            <h2>Настройки</h2>
            <p>Project ID, API key, домены, VAPID, trial и диагностика подключения сайта.</p>
          </div>
          <code>API key hidden in server env</code>
        </section>
      </section>

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
        h2{margin:0 0 18px;font-family:var(--font-display),Georgia,serif;font-weight:400;font-size:34px}
        .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
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
        .send{margin-top:16px;border-radius:8px;padding:12px;background:#f0eadf;color:#4d4338}
        .send.sent{background:#e6f3e8;color:#285634}
        .send.failed{background:#fff0ea;color:#873c2c}
        form{display:grid;gap:10px}
        input,textarea{border:1px solid rgba(21,18,15,.15);background:#fff;border-radius:6px;padding:12px;font:14px inherit}
        textarea{min-height:96px;resize:vertical}
        .phone{border-radius:28px;background:#17130f;color:#fff;min-height:230px;padding:24px;display:flex;flex-direction:column;justify-content:flex-end}
        .phone span{color:#c9ad80;text-transform:uppercase;letter-spacing:.16em;font-size:10px}
        .phone strong{font-size:28px;line-height:1;margin:8px 0}
        .phone small{color:#cfc5b8}
        .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        .cards h2{grid-column:1/-1}
        code{display:block;background:#17130f;color:#f8f3ea;border-radius:8px;padding:18px;white-space:pre-wrap}
        @media(max-width:880px){.dashboard{grid-template-columns:1fr}aside{position:static;height:auto}.metrics,.cards,.split{grid-template-columns:1fr}.table{grid-template-columns:1fr}.table span{border-right:0}.topline{display:grid}}
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