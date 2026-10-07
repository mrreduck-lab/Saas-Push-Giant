'use client';

import { FormEvent, useState } from 'react';

type AdminData = {
  totals?: { users:number; organizations:number; projects:number; active_subscriptions:number; campaigns:number; sent_deliveries:number };
  registrations?: Array<{id:string;email:string;name?:string;created_at:string;organization_name?:string;plan?:string;status?:string;projects:number;active_subscriptions:number}>;
  projects?: Array<{id:string;name:string;created_at:string;organization_name:string;plan:string;domain?:string;domain_status?:string;active_subscriptions:number;campaigns:number;sent_deliveries:number}>;
};

export default function AdminPage() {
  const [token,setToken]=useState('');
  const [data,setData]=useState<AdminData|null>(null);
  const [error,setError]=useState('');
  const [loading,setLoading]=useState(false);

  async function load(event?:FormEvent){
    event?.preventDefault(); setLoading(true); setError('');
    const response=await fetch('/api/admin/overview',{cache:'no-store',headers:{'x-admin-token':token}});
    const body=await response.json().catch(()=>({}));
    if(!response.ok){setError(response.status===401?'Неверный секрет администратора':body.error||'Не удалось загрузить данные');setLoading(false);return;}
    setData(body);setLoading(false);
  }
  const t=data?.totals;
  return <main className="owner">
    <header><div><p>Push Giant · Owner Admin</p><h1>Сервис под контролем</h1><span>Регистрации, проекты, подписчики и доставка — в одном кабинете.</span></div>
      <form onSubmit={load}><input type="password" placeholder="Секрет администратора" value={token} onChange={e=>setToken(e.target.value)} required/><button disabled={loading}>{loading?'Загрузка…':data?'Обновить':'Войти'}</button></form>
    </header>
    {error?<div className="error">{error}</div>:null}
    {data?<><section className="metrics">
      {[['Пользователи',t?.users],['Организации',t?.organizations],['Проекты',t?.projects],['Активные подписки',t?.active_subscriptions],['Кампании',t?.campaigns],['Доставлено',t?.sent_deliveries]].map(([l,v])=><article key={String(l)}><small>{l}</small><strong>{v??0}</strong></article>)}
    </section>
    <section className="panel"><div className="head"><div><p>PATH-3</p><h2>Последние регистрации</h2></div><span>{data.registrations?.length??0} записей</span></div>
      <div className="table"><div className="row labels"><span>Email</span><span>Организация</span><span>Тариф</span><span>Проекты</span><span>Подписки</span><span>Регистрация</span></div>
      {data.registrations?.map(x=><div className="row" key={x.id+x.organization_name}><strong>{x.email}</strong><span>{x.organization_name||'—'}</span><span>{x.plan||'—'}</span><span>{x.projects}</span><span>{x.active_subscriptions}</span><span>{new Date(x.created_at).toLocaleString('ru-RU')}</span></div>)}</div>
    </section>
    <section className="panel"><div className="head"><div><p>Projects</p><h2>Проекты клиентов</h2></div></div>
      <div className="table projects"><div className="row labels"><span>Проект</span><span>Клиент</span><span>Домен</span><span>Подписки</span><span>Кампании</span><span>Доставлено</span></div>
      {data.projects?.map(x=><div className="row" key={x.id}><strong>{x.name}</strong><span>{x.organization_name}</span><span>{x.domain||'—'} {x.domain_status?\`· \${x.domain_status}\`:''}</span><span>{x.active_subscriptions}</span><span>{x.campaigns}</span><span>{x.sent_deliveries}</span></div>)}</div>
    </section></>:<section className="welcome"><p>Отдельный кабинет владельца</p><h2>Войдите секретом администратора</h2><span>Клиентские API-ключи сюда не подходят. Данные загружаются только после проверки PUSH_ADMIN_TOKEN.</span></section>}
    <style jsx>{`
      .owner{min-height:100svh;background:#f4f1eb;color:#17130f;padding:32px;display:grid;gap:18px;font-family:var(--font-sans),sans-serif}
      header{display:flex;justify-content:space-between;gap:24px;align-items:end}p{margin:0;text-transform:uppercase;letter-spacing:.17em;font-size:10px;color:#725d45}h1{font-family:var(--font-display),Georgia,serif;font-size:clamp(44px,6vw,78px);font-weight:400;line-height:.9;margin:10px 0}header span{color:#685e54}
      form{display:flex;gap:8px}input{min-width:260px;padding:12px;border:1px solid #d7cfc4;border-radius:7px;background:#fff}button{padding:12px 16px;border:0;border-radius:7px;background:#17130f;color:white;cursor:pointer}
      .metrics{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.metrics article,.panel,.welcome{background:#fff;border:1px solid #ddd5cb;border-radius:10px;padding:18px}.metrics article{display:grid;gap:8px}.metrics strong{font-family:var(--font-display),Georgia,serif;font-size:36px;font-weight:400}
      .panel{display:grid;gap:14px}.head{display:flex;justify-content:space-between;align-items:end}.head h2,.welcome h2{margin:5px 0;font-family:var(--font-display),Georgia,serif;font-size:34px;font-weight:400}.table{overflow:auto}.row{min-width:900px;display:grid;grid-template-columns:1.5fr 1.2fr .7fr .5fr .6fr 1fr;gap:12px;padding:11px 8px;border-top:1px solid #eee7df;align-items:center;font-size:12px}.labels{font-size:9px;text-transform:uppercase;letter-spacing:.1em;color:#7a6c5e}.error{background:#f9e5e5;color:#8a2929;padding:12px;border-radius:7px}.welcome{max-width:700px;padding:28px}.welcome span{color:#685e54}
      @media(max-width:900px){.owner{padding:18px}header{display:grid}.metrics{grid-template-columns:repeat(2,1fr)}form{display:grid}input{min-width:0}}
    `}</style>
  </main>
}
