"use client";

import { FormEvent, useState } from "react";

type TrialState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: { organizationId: string; projectId: string; apiKey: string; trialEndsAt: string } }
  | { status: "error"; message: string };

type TrialResult = {
  organizationId: string;
  projectId: string;
  apiKey: string;
  trialEndsAt: string;
};

const TRIAL_PROJECT_STORAGE_KEY = "pushgiant.trialProject.v1";

export default function RegisterPage() {
  const [state, setState] = useState<TrialState>({ status: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState({ status: "loading" });

    const response = await fetch("/api/trials/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        company: form.get("company"),
        siteUrl: form.get("siteUrl"),
        password: form.get("password")
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setState({ status: "error", message: data.error ?? `register_failed_${response.status}` });
      return;
    }

    const result = data as TrialResult;
    saveTrialProject(result, {
      company: String(form.get("company") ?? ""),
      siteUrl: String(form.get("siteUrl") ?? "")
    });
    setState({ status: "success", result });
    event.currentTarget.reset();
  }

  return (
    <main className="register">
      <a className="brand" href="/">Push Giant</a>
      <section>
        <div>
          <p>Trial registration</p>
          <h1>Создать проект и получить API key</h1>
          <span>После отправки Core API создаст организацию, пользователя, проект, PWA-конфиг, VAPID и trial-ключ на 14 дней или 100 push.</span>
        </div>
        <form onSubmit={submit}>
          <input name="name" placeholder="Имя" required />
          <input name="email" type="email" placeholder="Email" required />
          <input name="company" placeholder="Компания" required />
          <input name="siteUrl" type="url" placeholder="https://example.com" required />
          <input name="password" type="password" placeholder="Пароль" required minLength={8} />
          <button disabled={state.status === "loading"}>{state.status === "loading" ? "Создаём..." : "Начать trial"}</button>
        </form>
      </section>

      {state.status === "success" ? (
        <aside className="result">
          <h2>Trial создан</h2>
          <div><span>Project ID</span><code>{state.result.projectId}</code></div>
          <div><span>API key</span><code>{state.result.apiKey}</code></div>
          <div><span>Trial до</span><code>{new Date(state.result.trialEndsAt).toLocaleString("ru-RU")}</code></div>
          <a href="/dashboard?project=production">Открыть кабинет</a>
          <a href="/downloads/pushgiant-wordpress.zip">Скачать WordPress plugin</a>
        </aside>
      ) : null}

      {state.status === "error" ? <div className="error">{state.message}</div> : null}

      <style jsx>{`
        .register{min-height:100svh;background:#f5f1ea;color:#15120f;padding:26px clamp(18px,5vw,72px) 72px;font-family:var(--font-sans),Arial,sans-serif}
        .brand,h1,h2{font-family:var(--font-display),Georgia,serif;font-weight:400}.brand{font-size:28px;font-weight:500}
        section{display:grid;grid-template-columns:minmax(0,1fr) minmax(320px,460px);gap:42px;align-items:start;margin-top:72px}
        p{margin:0 0 14px;text-transform:uppercase;letter-spacing:.2em;font-size:11px;color:#95744d}
        h1{font-size:clamp(52px,8vw,104px);line-height:.88;letter-spacing:-.04em;margin:0;max-width:820px}
        section span{display:block;max-width:640px;margin-top:24px;font-size:18px;line-height:1.55;color:#5d5247}
        form{display:grid;gap:10px;background:#fffaf3;border:1px solid rgba(21,18,15,.1);border-radius:8px;padding:22px}
        input,button{border-radius:7px;border:1px solid rgba(21,18,15,.16);padding:13px;font:14px inherit;background:#fff}
        button{background:#15120f;color:#fff;border-color:#15120f;cursor:pointer}button:disabled{opacity:.6;cursor:wait}
        .result,.error{margin-top:22px;background:#17130f;color:#f8f1e6;border-radius:8px;padding:22px;max-width:820px}.result h2{font-size:38px;margin:0 0 18px}.result div{display:grid;gap:6px;border-top:1px solid rgba(255,255,255,.12);padding:14px 0}.result span{color:#b89b70}.result code{word-break:break-all;color:#efe3d2}.result a{display:inline-flex;margin:10px 10px 0 0;border:1px solid rgba(255,255,255,.22);border-radius:7px;padding:11px 14px}.error{background:#fff0ea;color:#873c2c}
        @media(max-width:850px){section{grid-template-columns:1fr;margin-top:42px}h1{font-size:15vw}}
      `}</style>
    </main>
  );
}

function saveTrialProject(result: TrialResult, input: { company: string; siteUrl: string }) {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TRIAL_PROJECT_STORAGE_KEY, JSON.stringify({
    label: input.company.trim() || "Client production",
    siteUrl: input.siteUrl.trim(),
    organizationId: result.organizationId,
    projectId: result.projectId,
    apiKey: result.apiKey,
    trialEndsAt: result.trialEndsAt,
    savedAt: new Date().toISOString()
  }));
}
