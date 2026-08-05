 "use client";

import { integrationCards, marketingNav, pricingPlans, productSections } from "./product-data";

const launchSteps = [
  "Регистрация и trial",
  "Создание проекта",
  "Установка WordPress plugin",
  "Первый подписчик",
  "Первая push-рассылка"
];

export default function PushGiantHome() {
  return (
    <main className="pg">
      <header className="pgHeader">
        <a className="pgBrand" href="/">Push Giant</a>
        <nav>
          {marketingNav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          <a href="/login">Вход</a>
        </nav>
        <a className="pgHeaderCta" href="/register">Начать trial</a>
      </header>

      <section className="pgHero">
        <div>
          <p className="pgKicker">PWA push platform</p>
          <h1>Мобильный маркетинг поверх любого сайта</h1>
          <p className="pgLead">
            Push Giant добавляет PWA, установку на главный экран, web push, аналитику и CMS-плагины
            без переписывания существующего сайта.
          </p>
          <div className="pgActions">
            <a className="pgPrimary" href="/register">Создать trial</a>
            <a href="/dashboard">Открыть кабинет</a>
            <a href="/downloads/pushgiant-wordpress.zip">Скачать WordPress ZIP</a>
          </div>
        </div>
        <div className="pgConsole" aria-label="Product status">
          <span>Production status</span>
          <strong>API, Redis, SDK, ZIP online</strong>
          <small>Голый домен проверяется отдельно на уровне DNS/nginx.</small>
          <div>
            <b>readyz</b>
            <code>{`{"database":true,"redis":true}`}</code>
          </div>
        </div>
      </section>

      <section id="features" className="pgBand">
        <p className="pgKicker">MVP scope</p>
        <h2>Путь владельца сайта за 15-20 минут</h2>
        <div className="pgSteps">
          {launchSteps.map((step, index) => (
            <article key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </article>
          ))}
        </div>
      </section>

      <section className="pgGrid">
        {productSections.map((section) => (
          <article key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.text}</p>
          </article>
        ))}
      </section>

      <section className="pgSplit">
        <div>
          <p className="pgKicker">Client dashboard</p>
          <h2>Кабинет, админка и отправка push в одном интерфейсе</h2>
          <p>
            Текущий кабинет подключается к Core API, показывает подписчиков, создаёт кампанию и ставит
            её в BullMQ. Новые вкладки закрывают сегменты, геопуш, тариф, команду и настройки.
          </p>
          <a className="pgPrimary" href="/dashboard">Перейти в кабинет</a>
        </div>
        <div className="pgChecklist">
          {["Подписчики", "Рассылки", "Сегменты", "Геопуш", "PWA", "Интеграции", "Тарифы"].map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </section>

      <section className="pgBand">
        <p className="pgKicker">Pricing</p>
        <h2>Тарифы для запуска и роста</h2>
        <div className="pgPricing">
          {pricingPlans.slice(0, 4).map((plan) => (
            <article key={plan.name}>
              <span>{plan.name}</span>
              <strong>{plan.price}</strong>
              <small>{plan.note}</small>
              <a href="/pricing">Подробнее</a>
            </article>
          ))}
        </div>
      </section>

      <section className="pgGrid pgIntegrations">
        {integrationCards.map(([name, status, text]) => (
          <article key={name}>
            <span>{status}</span>
            <h3>{name}</h3>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <footer className="pgFooter">
        <strong>Push Giant</strong>
        <nav>
          <a href="/register">Регистрация</a>
          <a href="/pricing">Тарифы</a>
          <a href="/wordpress">WordPress</a>
          <a href="/docs">Документация</a>
        </nav>
      </footer>

      <style jsx>{`
        .pg{min-height:100svh;background:#f5f1ea;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}
        .pgHeader{min-height:72px;display:grid;grid-template-columns:auto 1fr auto;gap:28px;align-items:center;padding:18px clamp(18px,4vw,62px);border-bottom:1px solid rgba(21,18,15,.1);position:sticky;top:0;background:rgba(245,241,234,.94);backdrop-filter:blur(14px);z-index:10}
        .pgBrand{font-family:var(--font-display),Georgia,serif;font-size:28px;font-weight:500}
        .pgHeader nav,.pgFooter nav{display:flex;flex-wrap:wrap;gap:18px;font-size:13px;color:#5d5247}
        .pgHeaderCta,.pgPrimary,.pgActions a,.pgPricing a{display:inline-flex;align-items:center;justify-content:center;border:1px solid rgba(21,18,15,.22);border-radius:7px;padding:12px 15px;font-size:13px}
        .pgHeaderCta,.pgPrimary{background:#15120f;color:#fff;border-color:#15120f}
        .pgHero{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,420px);gap:42px;align-items:end;padding:clamp(62px,9vw,126px) clamp(18px,4vw,62px) 58px}
        .pgKicker{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}
        h1,h2,h3{font-family:var(--font-display),Georgia,serif;font-weight:400;line-height:.92;margin:0}
        h1{font-size:clamp(56px,8.7vw,124px);max-width:940px;letter-spacing:-.04em}
        h2{font-size:clamp(40px,5.8vw,76px);letter-spacing:-.035em;max-width:860px}
        h3{font-size:34px}
        .pgLead,.pgSplit p{font-size:18px;line-height:1.56;color:#5d5247;max-width:720px;margin:26px 0 0}
        .pgActions{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
        .pgActions a:not(.pgPrimary){background:#fffaf3}
        .pgConsole{background:#17130f;color:#f8f1e6;border-radius:8px;padding:24px;min-height:300px;display:flex;flex-direction:column;justify-content:flex-end;box-shadow:0 22px 60px rgba(21,18,15,.22)}
        .pgConsole span,.pgIntegrations span{font-size:10px;text-transform:uppercase;letter-spacing:.18em;color:#b7996b}
        .pgConsole strong{display:block;margin-top:10px;font-size:30px;font-weight:500;line-height:1}
        .pgConsole small{display:block;margin:12px 0 24px;color:#c9beae;line-height:1.45}
        .pgConsole div{border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:14px;background:rgba(255,255,255,.04)}
        .pgConsole b{display:block;margin-bottom:8px;color:#d8c29e}
        code{font-size:12px;color:#e7dfd2;white-space:normal}
        .pgBand,.pgSplit{padding:58px clamp(18px,4vw,62px);border-top:1px solid rgba(21,18,15,.1)}
        .pgSteps{display:grid;grid-template-columns:repeat(5,1fr);gap:1px;margin-top:32px;background:rgba(21,18,15,.12)}
        .pgSteps article,.pgGrid article,.pgPricing article{background:#fffaf3;padding:22px;min-height:150px}
        .pgSteps span{font-size:11px;color:#95744d}
        .pgSteps strong{display:block;margin-top:28px;font-size:21px;font-weight:500}
        .pgGrid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(21,18,15,.12);margin:0 clamp(18px,4vw,62px) 58px}
        .pgGrid p{color:#64594e;line-height:1.55;margin:16px 0 0}
        .pgSplit{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,430px);gap:36px;align-items:center}
        .pgSplit .pgPrimary{margin-top:28px}
        .pgChecklist{display:grid;grid-template-columns:1fr 1fr;gap:10px}
        .pgChecklist span{background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:18px;font-weight:500}
        .pgPricing{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:30px}
        .pgPricing span{font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:#95744d}
        .pgPricing strong{display:block;margin-top:16px;font-size:26px;font-weight:500}
        .pgPricing small{display:block;margin:8px 0 22px;color:#675c50}
        .pgPricing a{width:max-content;background:#15120f;color:#fff}
        .pgIntegrations{grid-template-columns:repeat(3,1fr)}
        .pgFooter{display:flex;justify-content:space-between;gap:24px;padding:34px clamp(18px,4vw,62px);background:#15120f;color:#f8f1e6}
        .pgFooter strong{font-family:var(--font-display),Georgia,serif;font-size:26px;font-weight:500}
        .pgFooter nav{color:#d3c7b8}
        @media(max-width:980px){.pgHero,.pgSplit{grid-template-columns:1fr}.pgSteps,.pgGrid,.pgPricing{grid-template-columns:1fr 1fr}.pgHeader{grid-template-columns:1fr}.pgHeader nav{order:3}.pgHeaderCta{width:max-content}}
        @media(max-width:620px){.pgHero{padding-top:44px}.pgSteps,.pgGrid,.pgPricing,.pgIntegrations{grid-template-columns:1fr}h1{font-size:15vw}.pgFooter{display:grid}.pgChecklist{grid-template-columns:1fr}}
      `}</style>
    </main>
  );
}
