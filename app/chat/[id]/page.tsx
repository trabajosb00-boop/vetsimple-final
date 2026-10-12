'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
export default function Chat(){
  const {id}=useParams() as {id:string}; const router=useRouter(); const [msgs,setMsgs]=useState<any[]>([]); const [texto,setTexto]=useState(''); const [de,setDe]=useState('recepcion');
  async function cargar(){const {data}=await supabase.from('mensajes_sala').select('*').eq('agenda_id',id).order('fecha'); setMsgs(data||[]);}
  useEffect(()=>{cargar(); const t=setInterval(cargar,3000); return()=>clearInterval(t);},[]);
  async function enviar(){if(!texto.trim())return; await supabase.from('mensajes_sala').insert({agenda_id:id,de,mensaje:texto}); setTexto(''); cargar();}
  return(<div style={{maxWidth:600,margin:'0 auto',padding:16,fontFamily:'system-ui',height:'90vh',display:'flex',flexDirection:'column'}}><button onClick={()=>router.push('/hoy')} style={{border:'1px solid #e5e7eb',background:'white',padding:'8px 12px',borderRadius:999,width:80}}>← Sala</button><h2 style={{fontWeight:800,marginTop:10}}>💬 Chat interno</h2><div style={{flex:1,background:'white',border:'1px solid #e5e7eb',borderRadius:14,padding:10,overflowY:'auto',marginTop:10}}>{msgs.map(m=><div key={m.id} style={{background:m.de==='medico'?'#dbeafe':'#f3f4f6',padding:8,borderRadius:10,marginBottom:6}}><b style={{fontSize:11}}>{m.de}</b><div style={{fontSize:13}}>{m.mensaje}</div></div>)}</div><div style={{display:'flex',gap:6,marginTop:10}}><select value={de} onChange={e=>setDe(e.target.value)} style={{padding:10,borderRadius:10,border:'1px solid #e5e7eb'}}><option value="recepcion">Recepción</option><option value="medico">Médico</option></select><input value={texto} onChange={e=>setTexto(e.target.value)} placeholder="¿Qué le cobro?" style={{flex:1,padding:10,borderRadius:10,border:'1px solid #e5e7eb'}}/><button onClick={enviar} style={{background:'#111827',color:'white',padding:'10px 16px',borderRadius:10}}>Enviar</button></div></div>);
}
