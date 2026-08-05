 "use client";

const endpoints = [
  ["GET", "/readyz", "Проверка базы и Redis"],
  ["GET", "/sdk/pushgiant.js", "Universal browser SDK"],
  ["GET", "/v1/projects/:projectId/config", "Публичный PWA config"],
  ["POST", "/v1/subscriptions/upsert", "Сохранить push subscription"],
  ["POST", "/v1/subscribers/heartbeat", "Обновить активность устройства"],
  ["POST", "/v1/events/track", "Записать событие"],
  ["POST", "/v1/campaigns", "Создать кампанию"],
  ["POST", "/v1/campaigns/:id/send-now", "Поставить в очередь"]
];

export default function DocsPage() {
  return (
    <main className="docs">
      <header><a href="/">Push Giant</a><nav><a href="/dashboard">Кабинет</a><a href="/wordpress">WordPress</a><a href="/register">Trial</a></nav></header>
      <section>
        <p>Documentation</p>
        <h1>Документация MVP API и SDK</h1>
        <span>Быстрый справочник для подключения сайта, проверки API и запуска первой рассылки.</span>
      </section>
      <div className="table">
        {["Method", "Endpoint", "Назначение"].map((head) => <b key={head}>{head}</b>)}
        {endpoints.flatMap(([method, path, note]) => [
          <code key={`${path}-m`}>{method}</code>,
          <code key={`${path}-p`}>{path}</code>,
          <span key={`${path}-n`}>{note}</span>
        ])}
      </div>
      <section className="snippet">
        <h2>SDK init</h2>
        <pre>{`<script src="https://api.pushgiant.ru/sdk/pushgiant.js"></script>
<script>
  PushGiant.init({
    projectId: "PROJECT_ID",
    apiUrl: "https://api.pushgiant.ru",
    serviceWorkerPath: "/pushgiant-sw.js"
  });
</script>`}</pre>
      </section>
      <style jsx>{`
        .docs{min-height:100svh;background:#f5f1ea;color:#15120f;font-family:var(--font-sans),Arial,sans-serif}header{min-height:72px;display:flex;justify-content:space-between;gap:24px;align-items:center;padding:18px clamp(18px,4vw,62px);border-bottom:1px solid rgba(21,18,15,.1)}header>a,h1,h2{font-family:var(--font-display),Georgia,serif;font-weight:400}header>a{font-size:28px;font-weight:500}nav{display:flex;gap:18px;color:#5d5247;font-size:13px}section{padding:48px clamp(18px,4vw,62px)}p{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}h1{font-size:clamp(52px,8vw,104px);line-height:.88;letter-spacing:-.04em;margin:0;max-width:900px}section span{display:block;margin-top:24px;max-width:680px;font-size:18px;line-height:1.55;color:#5d5247}.table{display:grid;grid-template-columns:120px minmax(240px,1fr) 1fr;margin:0 clamp(18px,4vw,62px);border:1px solid rgba(21,18,15,.1);border-radius:8px;overflow:hidden}.table>*{background:#fffaf3;border-right:1px solid rgba(21,18,15,.08);border-bottom:1px solid rgba(21,18,15,.08);padding:13px}.table b{background:#eee4d7;text-transform:uppercase;letter-spacing:.14em;font-size:10px;color:#6d5b46}.snippet pre{background:#17130f;color:#f8f1e6;border-radius:8px;padding:22px;overflow:auto}h2{font-size:38px;margin:0 0 16px}@media(max-width:760px){header{display:grid}.table{grid-template-columns:1fr}.table b{display:none}h1{font-size:15vw}}
      `}</style>
    </main>
  );
}
