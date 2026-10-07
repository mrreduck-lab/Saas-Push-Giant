'use client';

import { useEffect, useState } from 'react';

function urlBase64ToUint8Array(value:string){
  const padding='='.repeat((4-value.length%4)%4);
  const base64=(value+padding).replace(/-/g,'+').replace(/_/g,'/');
  const raw=window.atob(base64); return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)));
}

export default function TestPushPage(){
  const [projectId,setProjectId]=useState('');
  const [apiKey,setApiKey]=useState('');
  const [status,setStatus]=useState('Введите Project ID и API key вашего trial-проекта.');
  const [ready,setReady]=useState(false);
  const [sending,setSending]=useState(false);

  useEffect(()=>{try{const raw=localStorage.getItem('pushgiant.trialProject.v1');if(raw){const p=JSON.parse(raw);setProjectId(p.projectId||'');setApiKey(p.apiKey||'');}}catch{}},[]);

  async function subscribe(){
    if(!projectId||!apiKey){setStatus('Сначала зарегистрируйте trial или укажите Project ID и API key.');return;}
    setStatus('Запрашиваем разрешение…');
    const permission=await Notification.requestPermission();
    if(permission!=='granted'){setStatus('Разрешение на уведомления не выдано.');return;}
    const config=await fetch(`https://api.pushgiant.ru/v1/projects/${projectId}/config`).then(r=>r.json());
    if(!config.publicKey){setStatus('Не удалось получить VAPID public key проекта.');return;}
    const registration=await navigator.serviceWorker.register('/sw.js');
    const subscription=await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:urlBase64ToUint8Array(config.publicKey)});
    const json=subscription.toJSON();
    const response=await fetch('/api/platform/test/subscribe',{method:'POST',headers:{'Content-Type':'application/json','x-pushgiant-project-id':projectId,'x-pushgiant-api-key':apiKey},body:JSON.stringify({endpoint:json.endpoint,expirationTime:json.expirationTime,keys:json.keys})});
    if(!response.ok){setStatus('Подписка не зарегистрирована: '+response.status);return;}
    setReady(true);setStatus('Тестовое приложение подписано. Теперь отправьте push.');
  }

  async function send(){
    setSending(true);setStatus('Отправляем push в тестовое приложение…');
    const response=await fetch('/api/platform/test/send',{method:'POST',headers:{'Content-Type':'application/json','x-pushgiant-project-id':projectId,'x-pushgiant-api-key':apiKey},body:JSON.stringify({title:'Push Giant test',body:'Тестовое приложение получает push 🎉',url:'/test-push'})});
    const body=await response.json().catch(()=>({}));
    setSending(false);
    if(!response.ok){setStatus('Ошибка отправки: '+(body.error||response.status));return;}
    setStatus('Push отправлен. Проверьте системное уведомление браузера.');
  }

  return <main className="test"><section className="hero"><p>PATH-1 · Push Giant hosted test</p><h1>Проверьте push без своего сайта</h1><span>Браузер становится вашим тестовым приложением: подпишитесь здесь и отправьте уведомление из этого же кабинета.</span></section>
    <section className="flow">
      <article><b>1</b><h2>Trial-проект</h2><label>Project ID<input value={projectId} onChange={e=>setProjectId(e.target.value)}/></label><label>API key<input type="password" value={apiKey} onChange={e=>setApiKey(e.target.value)}/></label><a href="/register">Создать trial</a></article>
      <article><b>2</b><h2>Тестовое приложение</h2><p>Разрешите уведомления этому браузеру. Создадим изолированную test-подписку.</p><button onClick={subscribe}>Разрешить и подписаться</button></article>
      <article><b>3</b><h2>Отправка</h2><p>Push пойдёт именно в тестовую подписку, а не в аудиторию вашего сайта.</p><button disabled={!ready||sending} onClick={send}>{sending?'Отправляем…':'Отправить test push'}</button></article>
    </section>
    <output className={ready?'ok':''}>{status}</output>
    <nav><a href="/dashboard?project=production">Перейти к своему сайту / приложению →</a><a href="/admin">Owner Admin →</a></nav>
    <style jsx>{`
      .test{min-height:100svh;padding:48px max(20px,6vw);background:linear-gradient(135deg,#edf6ff,#fff 48%,#f0fff5);color:#111827;font-family:var(--font-sans),sans-serif}.hero{max-width:850px}.hero p{font-size:11px;text-transform:uppercase;letter-spacing:.18em;color:#1463d6}.hero h1{font-family:var(--font-display),Georgia,serif;font-size:clamp(48px,7vw,88px);font-weight:400;line-height:.92;margin:12px 0}.hero span{font-size:18px;color:#586174}
      .flow{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:38px 0 18px}.flow article{display:flex;flex-direction:column;gap:12px;background:rgba(255,255,255,.88);border:1px solid #dbe4ef;border-radius:16px;padding:22px;min-height:330px}.flow b{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#1265e6;color:white}.flow h2{margin:0;font-size:24px}.flow p{color:#5c6675;line-height:1.5}label{display:grid;gap:5px;font-size:10px;text-transform:uppercase;letter-spacing:.1em}input{padding:10px;border:1px solid #d4deea;border-radius:7px}button,a{width:max-content;margin-top:auto;padding:11px 14px;border-radius:8px;border:0;background:#1265e6;color:white;text-decoration:none;cursor:pointer}button:disabled{opacity:.4}.flow article:nth-child(2) b,.flow article:nth-child(2) button{background:#169447}.flow article:nth-child(3) b,.flow article:nth-child(3) button{background:#5d35c9}
      output{display:block;padding:16px;border-radius:10px;background:#fff5d9;color:#775615}.ok{background:#e8f8ed;color:#21683a}nav{display:flex;gap:12px;flex-wrap:wrap;margin-top:18px}nav a{margin:0;background:#17130f}
      @media(max-width:850px){.flow{grid-template-columns:1fr}.flow article{min-height:0}}
    `}</style>
  </main>
}
