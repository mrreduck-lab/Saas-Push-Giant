'use client';

const metrics = [
  ['Подписчики', '0', 'Raschini project'],
  ['Активные устройства', '0', 'last 30 days'],
  ['Новые подписки', '0', 'today'],
  ['Отправлено push', '0', 'trial 100'],
  ['Открытия', '0', 'tracking ready'],
  ['Статус сайта', 'pending', 'WordPress plugin']
];

const subscribers = [
  ['anonymous ID / CRM', 'Device', 'Browser', 'OS', 'Status'],
  ['anon_demo', 'iPhone', 'Safari', 'iOS', 'waiting for first install']
];

const nav = ['Обзор', 'Подписчики', 'Рассылки', 'PWA', 'Интеграции', 'Настройки'];

export default function DashboardPage() {
  return (
    <main className="dashboard">
      <aside>
        <a className="logo" href="/">Push Giant</a>
        <nav>{nav.map((item) => <a href={`#${item}`} key={item}>{item}</a>)}</nav>
        <div className="project">
          <span>Project</span>
          <strong>Raschini</strong>
          <small>WordPress pilot</small>
        </div>
      </aside>

      <section className="content">
        <div className="topline">
          <div>
            <p>Control project</p>
            <h1>Raschini pilot dashboard</h1>
          </div>
          <a href="/plugins/wordpress/pushgiant.php">Download WordPress plugin</a>
        </div>

        <section id="Обзор" className="panel overview">
          <h2>Обзор</h2>
          <div className="metrics">
            {metrics.map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>
        </section>

        <section id="Подписчики" className="panel">
          <h2>Подписчики</h2>
          <div className="table">
            {subscribers.flatMap((row, rowIndex) =>
              row.map((cell, cellIndex) => (
                <span className={rowIndex === 0 ? 'head' : ''} key={`${rowIndex}-${cellIndex}`}>{cell}</span>
              ))
            )}
          </div>
        </section>

        <section id="Рассылки" className="panel split">
          <div>
            <h2>Рассылки</h2>
            <p>Заголовок, текст, изображение, URL, сегмент, тестовая отправка, отправить сейчас, запланировать.</p>
          </div>
          <form>
            <input placeholder="Заголовок push" />
            <textarea placeholder="Текст уведомления" />
            <input placeholder="https://raschini.com/new/" />
            <button type="button">Тестовая отправка</button>
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
            <small>manifest + service worker pending</small>
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
          <code>Project ID: 22222222-2222-4222-8222-222222222222</code>
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
        .panel{background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:24px;margin-bottom:16px}
        h2{margin:0 0 18px;font-family:var(--font-display),Georgia,serif;font-weight:400;font-size:34px}
        .metrics{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
        article{border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:16px;background:#fff}
        article span{display:block;font-size:12px;color:#7b6d5e}
        article strong{display:block;margin-top:10px;font-size:28px;font-weight:500}
        article small{display:block;margin-top:6px;color:#8a7b69}
        .table{display:grid;grid-template-columns:1.4fr 1fr 1fr 1fr 1.4fr;border:1px solid rgba(21,18,15,.1);border-radius:8px;overflow:hidden}
        .table span{padding:13px;background:#fff;border-right:1px solid rgba(21,18,15,.08);border-bottom:1px solid rgba(21,18,15,.08);font-size:13px}
        .table .head{background:#eee6da;text-transform:uppercase;letter-spacing:.12em;font-size:10px;color:#6f5d49}
        .split{display:grid;grid-template-columns:1fr minmax(260px,.8fr);gap:24px;align-items:start}
        .split p{margin:0;color:#62574c;line-height:1.55}
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
