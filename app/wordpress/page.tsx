 "use client";

export default function WordPressPage() {
  return (
    <main className="cms">
      <header><a href="/">Push Giant</a><nav><a href="/pricing">Тарифы</a><a href="/register">Регистрация</a><a href="/dashboard">Кабинет</a></nav></header>
      <section className="hero">
        <p>WordPress plugin</p>
        <h1>Плагин для PWA и push на WordPress</h1>
        <span>Установка как обычного plugin: ввести Project ID, API URL и API key, затем включить storefront prompt.</span>
        <a href="/downloads/pushgiant-wordpress.zip">Скачать ZIP</a>
      </section>
      <section className="grid">
        {[
          ["SDK loader", "Подключает /sdk/pushgiant.js с API-домена."],
          ["Manifest", "Отдаёт /wp-json/pushgiant/v1/manifest для PWA."],
          ["Service worker", "Создаёт /pushgiant-sw.js с обработкой push и кликов."],
          ["WooCommerce", "События магазина заложены как следующий слой коннектора."]
        ].map(([title, text]) => <article key={title}><h2>{title}</h2><p>{text}</p></article>)}
      </section>
      <style jsx>{`
        .cms{min-height:100svh;background:#f5f1ea;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}header{min-height:72px;display:flex;justify-content:space-between;gap:24px;align-items:center;padding:18px clamp(18px,4vw,62px);border-bottom:1px solid rgba(21,18,15,.1)}header>a,h1,h2{font-family:var(--font-display),Georgia,serif;font-weight:400}header>a{font-size:28px;font-weight:500}nav{display:flex;gap:18px;color:#5d5247;font-size:13px}.hero{padding:58px clamp(18px,4vw,62px)}.hero p{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}h1{font-size:clamp(52px,8vw,104px);line-height:.88;letter-spacing:-.04em;margin:0;max-width:900px}.hero span{display:block;margin-top:24px;max-width:680px;font-size:18px;line-height:1.55;color:#5d5247}.hero a{display:inline-flex;margin-top:28px;background:#15120f;color:#fff;border-radius:7px;padding:13px 16px}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(21,18,15,.12);margin:0 clamp(18px,4vw,62px) 72px}.grid article{background:#fffaf3;padding:22px;min-height:210px}h2{font-size:34px;margin:0 0 16px}.grid p{color:#5d5247;line-height:1.55}@media(max-width:850px){header{display:grid}.grid{grid-template-columns:1fr 1fr}}@media(max-width:560px){.grid{grid-template-columns:1fr}h1{font-size:15vw}}
      `}</style>
    </main>
  );
}
