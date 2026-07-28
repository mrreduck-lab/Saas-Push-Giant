'use client';

import { useState } from 'react';

type DiagnosticResult = {
  browser?: {
    standalone: boolean;
    notificationPermission: NotificationPermission | 'unsupported';
    serviceWorker: boolean;
    pushManager: boolean;
    subscription: boolean;
  };
  server?: unknown;
  error?: string;
};

export default function DebugPushPage() {
  const [token, setToken] = useState('');
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDiagnostics() {
    setLoading(true);
    try {
      const serviceWorker = 'serviceWorker' in navigator;
      const pushManager = 'PushManager' in window;
      const notificationPermission = 'Notification' in window ? Notification.permission : 'unsupported';
      const standalone = window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone);

      let subscription = false;
      if (serviceWorker) {
        const registration = await navigator.serviceWorker.getRegistration();
        subscription = Boolean(await registration?.pushManager.getSubscription());
      }

      const response = await fetch('/api/push/debug', {
        headers: { 'x-admin-token': token },
        cache: 'no-store',
      });
      const server = await response.json();

      setResult({
        browser: { standalone, notificationPermission, serviceWorker, pushManager, subscription },
        server,
        error: response.ok ? undefined : server.error || `HTTP ${response.status}`,
      });
    } catch (error: unknown) {
      setResult({ error: error instanceof Error ? error.message : String(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="debug">
      <section>
        <p>Raschini PWA</p>
        <h1>Диагностика push</h1>
        <label>Секрет администратора<input type="password" value={token} onChange={(event) => setToken(event.target.value)} /></label>
        <button type="button" onClick={runDiagnostics} disabled={loading}>{loading ? 'Проверяем…' : 'Запустить диагностику'}</button>
        {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
      </section>
      <style jsx>{`
        .debug{min-height:100svh;background:#eee8df;color:#17130f;padding:48px 20px;display:grid;place-items:center}
        section{width:min(720px,100%);display:grid;gap:20px}
        p{margin:0;text-transform:uppercase;letter-spacing:.24em;font-size:10px;color:#987b55}
        h1{margin:0 0 8px;font-family:var(--font-display),serif;font-size:clamp(48px,8vw,86px);font-weight:400;line-height:.86}
        label{display:grid;gap:8px;text-transform:uppercase;letter-spacing:.14em;font-size:9px}
        input{width:100%;border:0;border-bottom:1px solid rgba(23,19,15,.3);background:transparent;padding:12px 0;font:16px var(--font-sans),sans-serif;color:inherit;outline:none}
        button{justify-self:start;border:1px solid #17130f;background:#17130f;color:#fff;padding:14px 22px;text-transform:uppercase;letter-spacing:.16em;font-size:10px;cursor:pointer}
        pre{margin:8px 0 0;padding:18px;overflow:auto;background:#17130f;color:#f5efe6;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word}
      `}</style>
    </main>
  );
}
