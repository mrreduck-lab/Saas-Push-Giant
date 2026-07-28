'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(value: string): Uint8Array {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

export default function PushPrompt() {
  const [available, setAvailable] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    if (!supported || Notification.permission === 'denied') return;
    navigator.serviceWorker.register('/sw.js').then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      setAvailable(!subscription);
    }).catch(console.error);
  }, []);

  async function subscribe() {
    setStatus('loading');
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permission denied');
      const registration = await navigator.serviceWorker.ready;
      const keyResponse = await fetch('/api/push/public-key', { cache: 'no-store' });
      if (!keyResponse.ok) throw new Error('Push is not configured');
      const { publicKey } = await keyResponse.json() as { publicKey: string };
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON()),
      });
      if (!response.ok) throw new Error('Unable to save subscription');
      setStatus('done');
      setTimeout(() => setAvailable(false), 1800);
    } catch (error) {
      console.error(error);
      setStatus('error');
    }
  }

  if (!available) return null;

  return (
    <button className="pushPrompt" onClick={subscribe} disabled={status === 'loading'}>
      <span>{status === 'done' ? 'Уведомления включены' : status === 'error' ? 'Не удалось включить' : 'Получать новости Raschini'}</span>
      <small>{status === 'idle' ? 'Редкие уведомления о коллекциях и событиях' : status === 'loading' ? 'Подключаем…' : ''}</small>
      <style jsx>{`
        .pushPrompt{position:fixed;z-index:65;right:18px;bottom:max(18px,env(safe-area-inset-bottom));max-width:310px;padding:15px 18px;border:1px solid rgba(155,120,68,.4);background:rgba(244,239,232,.96);color:#17130f;text-align:left;box-shadow:0 12px 38px rgba(0,0,0,.14);cursor:pointer}
        span{display:block;font-family:var(--font-display),serif;font-size:19px;line-height:1.05}
        small{display:block;margin-top:6px;font-size:9px;line-height:1.45;letter-spacing:.08em;text-transform:uppercase;color:#8d7452}
        @media(max-width:600px){.pushPrompt{left:14px;right:14px;bottom:max(14px,env(safe-area-inset-bottom));max-width:none}}
      `}</style>
    </button>
  );
}
