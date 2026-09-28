"use client";
import { FormEvent, useEffect, useState } from "react";

type Campaign={id:string;name:string;relevant_text:string;status:string;level_filter:number[];locations:{latitude:number;longitude:number}[]};
export default function WalletPage(){
 const [items,setItems]=useState<Campaign[]>([]),[message,setMessage]=useState("");
 const load=()=>fetch("/api/platform/wallet/geo-campaigns",{cache:"no-store"}).then(r=>r.json()).then(d=>setItems(d.campaigns||[])).catch(()=>setMessage("Не удалось загрузить кампании"));
 useEffect(()=>{load()},[]);
 async function submit(e:FormEvent<HTMLFormElement>){e.preventDefault();setMessage("Сохраняем…");const f=new FormData(e.currentTarget);
  const body={name:String(f.get("name")||""),relevant_text:String(f.get("text")||""),locations:[{latitude:Number(f.get("lat")),longitude:Number(f.get("lng"))}],level_filter:[1,2,3,4,5,6]};
  const r=await fetch("/api/platform/wallet/geo-campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
  setMessage(r.ok?"Кампания сохранена":"Ошибка сохранения");if(r.ok){e.currentTarget.reset();load();}
 }
 async function action(id:string,a:"activate"|"stop"){const r=await fetch(`/api/platform/wallet/geo-campaigns/${id}/${a}`,{method:"POST"});setMessage(r.ok?(a==="activate"?"Кампания запущена":"Кампания остановлена"):"Ошибка");load();}
 return <main style={{maxWidth:980,margin:"0 auto",padding:"36px 20px",fontFamily:"Arial,sans-serif",color:"#17130f"}}>
  <a href="/dashboard">← Dashboard</a><h1 style={{fontFamily:"Georgia,serif",fontWeight:400,fontSize:54,marginBottom:8}}>Push Giant Wallet</h1>
  <p style={{color:"#6b6259"}}>Geo Campaigns · координаты и текст Apple Wallet без лишней карты в интерфейсе.</p>
  <section style={{border:"1px solid #ddd3c6",padding:22,borderRadius:10,margin:"28px 0",background:"#fffaf3"}}>
   <h2>Новая геокампания</h2><form onSubmit={submit} style={{display:"grid",gap:12}}>
    <input name="name" required placeholder="Название кампании" style={field}/>
    <textarea name="text" required maxLength={240} placeholder="Текст relevantText" style={{...field,minHeight:90}}/>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><input name="lat" required type="number" step="any" min="-90" max="90" placeholder="Latitude" style={field}/><input name="lng" required type="number" step="any" min="-180" max="180" placeholder="Longitude" style={field}/></div>
    <button style={button}>Сохранить</button>
   </form>{message&&<p>{message}</p>}
  </section>
  <section><h2>Кампании</h2>{items.length===0?<p>Пока нет кампаний.</p>:items.map(c=><article key={c.id} style={{border:"1px solid #ddd3c6",padding:18,borderRadius:10,marginBottom:10}}>
   <strong>{c.name}</strong> · {c.status}<p>{c.relevant_text}</p><small>{c.locations.map(x=>`${x.latitude}, ${x.longitude}`).join(" · ")}</small>
   <div style={{marginTop:14,display:"flex",gap:8}}>{c.status!=="active"&&c.status!=="cancelled"&&<button style={button} onClick={()=>action(c.id,"activate")}>Запустить</button>}{c.status==="active"&&<button style={button} onClick={()=>action(c.id,"stop")}>Остановить</button>}</div>
  </article>)}</section>
 </main>
}
const field={padding:"12px 13px",border:"1px solid #cfc4b5",borderRadius:7,fontSize:15,background:"#fff"} as const;
const button={padding:"12px 16px",border:0,borderRadius:7,background:"#17130f",color:"#fff",width:"max-content",cursor:"pointer"} as const;
