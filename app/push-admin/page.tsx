'use client';

import { FormEvent, useState } from 'react';

export default function PushAdminPage() {
  const [token, setToken] = useState('');
  const [title, setTitle] = useState('Новости проекта');
  const [body, setBody] = useState('Новое сообщение уже доступно на сайте.');
  const [url, setUrl] = useState('https://pushgiant.ru/');
  const [image, setImage] = useState('');
  const [result, setResult] = useState('');
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSending(true);
    setResult('Отправляем…');

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ title, body, url, image: image.trim() || undefined }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (response.ok) {
        setResult(`Отправлено: ${data.sent} из ${data.total}. Redis: ${data.redisLatencyMs} мс, всего: ${data.durationMs} мс.`);
      } else {
        const details = data.failures?.length ? ` ${JSON.stringify(data.failures)}` : '';
        setResult(`Ошибка: ${data.error || `HTTP ${response.status}`}.${details}`);
      }
    } catch (error: unknown) {
      const message = error instanceof Error && error.name === 'AbortError'
        ? 'Запрос превысил 25 секунд и был остановлен.'
        : error instanceof Error ? error.message : String(error);
      setResult(`Ошибка: ${message}`);
    } finally {
      clearTimeout(timeout);
      setSending(false);
    }
  }

  return (
    <main className="admin">
      <form onSubmit={submit}>
        <p>Push Giant</p>
        <h1>Отправить push</h1>
        <label>Секрет администратора<input type="password" value={token} onChange={(e) => setToken(e.target.value)} required /></label>
        <label>Заголовок<input value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label>Текст<textarea value={body} onChange={(e) => setBody(e.target.value)} required /></label>
        <label>Ссылка<input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required /></label>
        <label>Фото для push — HTTPS-ссылка, необязательно<input type="url" placeholder="https://.../photo.jpg" value={image} onChange={(e) => setImage(e.target.value)} /></label>
        <small>Без фото используется иконка проекта. С фото оно подставляется в уведомление; отображение крупного изображения зависит от устройства.</small>
        <button type="submit" disabled={sending}>{sending ? 'Отправляем…' : 'Отправить уведомление'}</button>
        <a href="/debug-push">Открыть диагностику</a>
        <output>{result}</output>
      </form>
      <style jsx>{`
        .admin{min-height:100svh;background:#eee8df;color:#17130f;padding:60px 20px;display:grid;place-items:center}
        form{width:min(620px,100%);display:grid;gap:22px}
        p{margin:0;text-transform:uppercase;letter-spacing:.24em;font-size:10px;color:#987b55}
        h1{margin:0 0 12px;font-family:var(--font-display),serif;font-size:clamp(52px,8vw,88px);font-weight:400;line-height:.85}
        label{display:grid;gap:8px;text-transform:uppercase;letter-spacing:.14em;font-size:9px}
        input,textarea{width:100%;border:0;border-bottom:1px solid rgba(23,19,15,.3);background:transparent;padding:12px 0;font:16px var(--font-sans),sans-serif;color:inherit;outline:none}
        textarea{min-height:110px;resize:vertical}
        small{font-size:11px;line-height:1.55;color:#7b6548}
        button{justify-self:start;border:1px solid #17130f;background:#17130f;color:#fff;padding:14px 22px;text-transform:uppercase;letter-spacing:.16em;font-size:10px;cursor:pointer}
        button:disabled{opacity:.55;cursor:wait}
        a{width:max-content;border-bottom:1px solid currentColor;padding-bottom:5px;text-transform:uppercase;letter-spacing:.14em;font-size:9px}
        output{min-height:22px;font-size:13px;line-height:1.55;color:#7b6548;word-break:break-word}
      `}</style>
    </main>
  );
}
