 "use client";

import { marketingNav, pricingPlans } from "../product-data";

export default function PricingPage() {
  return (
    <main className="page">
      <header>
        <a className="brand" href="/">Push Giant</a>
        <nav>{marketingNav.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}</nav>
        <a className="cta" href="/register">Начать trial</a>
      </header>
      <section className="intro">
        <p>Pricing</p>
        <h1>Тарифы от trial до enterprise</h1>
        <span>Trial создаёт проект, API key и PWA-настройки автоматически. Платежные провайдеры заложены как следующий production-шаг: ЮKassa, CloudPayments и счёт.</span>
      </section>
      <section className="plans">
        {pricingPlans.map((plan) => (
          <article key={plan.name}>
            <p>{plan.name}</p>
            <strong>{plan.price}</strong>
            <small>{plan.note}</small>
            <ul>
              {plan.features.map((feature) => <li key={feature}>{feature}</li>)}
            </ul>
            <a href="/register">{plan.name === "Enterprise" ? "Запросить условия" : "Выбрать тариф"}</a>
          </article>
        ))}
      </section>
      <section className="payments">
        <h2>Платежи</h2>
        <div><b>ЮKassa</b><span>карты, СБП, автопродление после подключения merchant credentials</span></div>
        <div><b>CloudPayments</b><span>резервный acquiring provider для подписок</span></div>
        <div><b>Счёт</b><span>ручное выставление для Business, Pro и Enterprise</span></div>
      </section>
      <style jsx>{`
        .page{min-height:100svh;background:#f5f1ea;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}
        header{min-height:72px;display:grid;grid-template-columns:auto 1fr auto;gap:24px;align-items:center;padding:18px clamp(18px,4vw,62px);border-bottom:1px solid rgba(21,18,15,.1)}
        .brand,h1,h2{font-family:var(--font-display),Georgia,serif;font-weight:400}.brand{font-size:28px;font-weight:500}
        nav{display:flex;flex-wrap:wrap;gap:18px;color:#5d5247;font-size:13px}.cta,.plans a{border-radius:7px;background:#15120f;color:#fff;padding:12px 15px;font-size:13px}
        .intro{padding:58px clamp(18px,4vw,62px) 28px}.intro p{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}
        h1{font-size:clamp(52px,8vw,106px);line-height:.88;letter-spacing:-.04em;margin:0;max-width:900px}.intro span{display:block;max-width:760px;margin-top:24px;font-size:18px;line-height:1.55;color:#5d5247}
        .plans{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;padding:22px clamp(18px,4vw,62px) 58px}.plans article{background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:22px;display:flex;flex-direction:column;min-height:420px}
        .plans p{margin:0;text-transform:uppercase;letter-spacing:.18em;font-size:11px;color:#95744d}.plans strong{display:block;margin-top:18px;font-size:28px;font-weight:500}.plans small{margin-top:8px;color:#6a5e52}
        ul{margin:24px 0;padding-left:18px;display:grid;gap:10px;color:#5d5247}.plans a{margin-top:auto;text-align:center}
        .payments{display:grid;grid-template-columns:1fr repeat(3,1fr);gap:10px;padding:34px clamp(18px,4vw,62px) 72px;border-top:1px solid rgba(21,18,15,.1)}
        h2{font-size:42px;margin:0}.payments div{background:#17130f;color:#f8f1e6;border-radius:8px;padding:20px}.payments b{display:block;margin-bottom:8px}.payments span{color:#cfc3b4;line-height:1.45}
        @media(max-width:1100px){.plans{grid-template-columns:1fr 1fr}.payments{grid-template-columns:1fr 1fr}header{grid-template-columns:1fr}.cta{width:max-content}}
        @media(max-width:640px){.plans,.payments{grid-template-columns:1fr}h1{font-size:15vw}}
      `}</style>
    </main>
  );
}
