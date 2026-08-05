"use client";

import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [message, setMessage] = useState<string | null>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("Парольная сессия будет подключена следующим шагом. Для текущего MVP кабинет открывается по серверному API key.");
  }

  return (
    <main className="login">
      <a className="brand" href="/">Push Giant</a>
      <section>
        <p>Client login</p>
        <h1>Вход в кабинет</h1>
        <form onSubmit={submit}>
          <input type="email" placeholder="Email" required />
          <input type="password" placeholder="Пароль" required />
          <button>Войти</button>
          <a href="/dashboard">Открыть текущий pilot dashboard</a>
        </form>
        {message ? <div>{message}</div> : null}
      </section>
      <style jsx>{`
        .login{min-height:100svh;background:#f5f1ea;color:#15120f;padding:26px clamp(18px,5vw,72px);font-family:var(--font-sans),Arial,sans-serif}.brand,h1{font-family:var(--font-display),Georgia,serif;font-weight:400}.brand{font-size:28px;font-weight:500}section{max-width:620px;margin-top:80px}p{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}h1{font-size:clamp(58px,10vw,108px);line-height:.86;margin:0 0 30px}form{display:grid;gap:10px;background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:22px}input,button{border-radius:7px;border:1px solid rgba(21,18,15,.16);padding:13px;font:14px inherit;background:#fff}button{background:#15120f;color:#fff;border-color:#15120f}form a{text-align:center;color:#6a5d50}div{margin-top:14px;background:#fff0d8;border-radius:8px;padding:14px;color:#6d5734}
      `}</style>
    </main>
  );
}
