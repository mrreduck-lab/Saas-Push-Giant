'use client';

const pilotSteps = [
  'Создать проект Raschini',
  'Скачать WordPress-плагин',
  'Подключить API key',
  'Подписаться с телефона',
  'Отправить тестовый push',
  'Увидеть статистику'
];

const integrations = [
  ['WordPress', 'Raschini pilot', 'plugin scaffold ready'],
  ['Bitrix', 'YULIAWAVE pilot', 'next connector'],
  ['Universal JS', 'Any site', 'SDK contract ready']
];

export default function PushGiantHome() {
  return (
    <main className="site">
      <header>
        <a className="brand" href="/">Push Giant</a>
        <nav>
          <a href="/dashboard">Кабинет</a>
          <a href="/push-admin">Legacy push</a>
          <a href="/raschini-demo">Raschini demo</a>
        </nav>
      </header>

      <section className="hero">
        <p className="kicker">PWA push platform</p>
        <h1>Пилоты сначала. SaaS потом.</h1>
        <p className="lead">
          Push Giant добавляет PWA, установку на главный экран и web push поверх существующего сайта:
          сначала Raschini на WordPress, затем YULIAWAVE на Bitrix.
        </p>
        <div className="actions">
          <a className="primary" href="/dashboard">Открыть кабинет</a>
          <a href="/plugins/wordpress/pushgiant.php">WordPress plugin</a>
        </div>
      </section>

      <section className="grid">
        <article>
          <p className="kicker">Pilot 1</p>
          <h2>Raschini WordPress</h2>
          <ol>
            {pilotSteps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </article>
        <article>
          <p className="kicker">Pilot 2</p>
          <h2>YULIAWAVE Bitrix</h2>
          <p>
            Второй проект подключается на том же ядре: Bitrix user ID, просмотр товара,
            корзина, заказ и базовые сегменты.
          </p>
        </article>
      </section>

      <section className="integrations">
        {integrations.map(([name, target, status]) => (
          <div key={name}>
            <span>{name}</span>
            <strong>{target}</strong>
            <small>{status}</small>
          </div>
        ))}
      </section>

      <style jsx>{`
        .site{min-height:100svh;background:#f6f3ee;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}
        header{height:72px;display:flex;align-items:center;justify-content:space-between;padding:0 clamp(20px,5vw,72px);border-bottom:1px solid rgba(21,18,15,.1)}
        .brand{font-family:var(--font-display),Georgia,serif;font-size:24px;color:#15120f}
        nav{display:flex;gap:22px;font-size:13px}
        .hero{padding:clamp(64px,11vw,132px) clamp(20px,5vw,72px) clamp(48px,8vw,92px);max-width:980px}
        .kicker{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#92734e}
        h1{margin:0;font-family:var(--font-display),Georgia,serif;font-weight:400;font-size:clamp(56px,9vw,116px);line-height:.88;max-width:820px}
        .lead{margin:28px 0 0;max-width:660px;font-size:18px;line-height:1.55;color:#5c5146}
        .actions{display:flex;flex-wrap:wrap;gap:14px;margin-top:34px}
        .actions a{border:1px solid rgba(21,18,15,.22);padding:13px 18px;border-radius:6px;font-size:13px}
        .actions .primary{background:#15120f;color:#fff;border-color:#15120f}
        .grid{display:grid;grid-template-columns:1.25fr .75fr;gap:1px;background:rgba(21,18,15,.12);margin:0 clamp(20px,5vw,72px)}
        article{background:#fffaf3;padding:clamp(24px,4vw,42px);min-height:280px}
        h2{margin:0 0 22px;font-family:var(--font-display),Georgia,serif;font-weight:400;font-size:clamp(34px,5vw,58px);line-height:.95}
        ol{margin:0;padding-left:20px;display:grid;gap:12px;color:#51483f}
        article p:not(.kicker){font-size:16px;line-height:1.6;color:#51483f;max-width:520px}
        .integrations{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:rgba(21,18,15,.12);margin:1px clamp(20px,5vw,72px) 72px}
        .integrations div{background:#ede6db;padding:22px;display:grid;gap:6px}
        .integrations span{font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#92734e}
        .integrations strong{font-size:18px;font-weight:500}
        .integrations small{color:#6b5d4d}
        @media(max-width:760px){header{height:auto;align-items:flex-start;gap:18px;flex-direction:column;padding-top:18px;padding-bottom:18px}nav{flex-wrap:wrap}.grid,.integrations{grid-template-columns:1fr}.hero{padding-top:48px}}
      `}</style>
    </main>
  );
}
