 "use client";

export default function BitrixPage() {
  return (
    <main className="bitrix">
      <header><a href="/">Push Giant</a><nav><a href="/wordpress">WordPress</a><a href="/pricing">Тарифы</a><a href="/register">Регистрация</a></nav></header>
      <section>
        <p>Bitrix module</p>
        <h1>Bitrix-коннектор в очереди после WordPress pilot</h1>
        <span>Модуль будет использовать то же API-ядро: PWA, push-подписки, auth user, каталог, корзина, заказ и диагностика.</span>
      </section>
      <div className="grid">
        {["Подключение SDK", "Manifest и service worker", "Синхронизация пользователя", "Просмотр товара", "Корзина", "Заказ"].map((item) => <article key={item}>{item}</article>)}
      </div>
      <style jsx>{`
        .bitrix{min-height:100svh;background:#f5f1ea;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}header{min-height:72px;display:flex;justify-content:space-between;gap:24px;align-items:center;padding:18px clamp(18px,4vw,62px);border-bottom:1px solid rgba(21,18,15,.1)}header>a,h1{font-family:var(--font-display),Georgia,serif;font-weight:400}header>a{font-size:28px;font-weight:500}nav{display:flex;gap:18px;color:#5d5247;font-size:13px}section{padding:58px clamp(18px,4vw,62px)}p{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}h1{font-size:clamp(52px,8vw,104px);line-height:.88;letter-spacing:-.04em;margin:0;max-width:980px}span{display:block;margin-top:24px;max-width:720px;font-size:18px;line-height:1.55;color:#5d5247}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 clamp(18px,4vw,62px) 72px}article{background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:24px;font-size:21px;font-weight:500}@media(max-width:760px){header{display:grid}.grid{grid-template-columns:1fr}h1{font-size:15vw}}
      `}</style>
    </main>
  );
}
