'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function ChatVet(){
  const [open,setOpen]=useState(false);
  const [vista,setVista]=useState<'bandeja'|'chat'>('bandeja');
  const [chats,setChats]=useState<any[]>([]);
  const [msgs,setMsgs]=useState<any[]>([]);
  const [sel,setSel]=useState<any>(null);
  const [txt,setTxt]=useState('');

  async function cargarBandeja(){
    const {data}=await supabase.from('mensajes_chat').select('*, agenda(pacientes(nombre))').order('created_at',{ascending:false}).limit(20);
    // agrupa por agenda_id = 1 chat por paciente
    const map = new Map(); data?.forEach(m=>{ if(!map.has(m.agenda_id)) map.set(m.agenda_id,m) });
    setChats(Array.from(map.values()));
  }
  async function abrirChat(c:any){
    setSel(c); setVista('chat');
    const {data}=await supabase.from('mensajes_chat').select('*').eq('agenda_id',c.agenda_id).order('created_at');
    setMsgs(data||[]);
  }
  async function enviar(){
    if(!txt ||!sel) return;
    await supabase.from('mensajes_chat').insert({agenda_id:sel.agenda_id, de:'recepcion', para:'medico', mensaje:txt, paciente_id:sel.paciente_id});
    setTxt(''); const {data}=await supabase.from('mensajes_chat').select('*').eq('agenda_id',sel.agenda_id).order('created_at'); setMsgs(data||[]);
  }

  if(!open) return <button onClick={()=>{setOpen(true); cargarBandeja();}} style={{position:'fixed',bottom:90,right:16,width:56,height:56,borderRadius:28,background:'#111827',color:'white',border:0,fontSize:22,boxShadow:'0 8px 24px rgba(0,0,0,0.3)',zIndex:50}}>💬</button>;

  return(
    <div style={{position:'fixed',bottom:90,right:16,width:360,height:480,background:'white',borderRadius:16,border:'1px solid #e5e7eb',boxShadow:'0 12px 40px rgba(0,0,0,0.25)',display:'flex',flexDirection:'column',zIndex:50,fontFamily:'system-ui'}}>
      <div style={{background:'#111827',color:'white',padding:12,borderRadius:'16px 16px 0 0',display:'flex',justifyContent:'space-between'}}>
        <b>{vista==='bandeja'? 'Bandeja - Chats médicos' : sel?.agenda?.pacientes?.nombre}</b>
        <div style={{display:'flex',gap:8}}>{vista==='chat' && <button onClick={()=>setVista('bandeja')} style={{background:'transparent',color:'white',border:0}}>←</button>}<button onClick={()=>setOpen(false)} style={{background:'transparent',color:'white',border:0}}>✕</button></div>
      </div>
      {vista==='bandeja'? (
        <div style={{flex:1,overflowY:'auto'}}>{chats.map(c=><div key={c.id} onClick={()=>abrirChat(c)} style={{padding:12,borderBottom:'1px solid #f3f4f6',cursor:'pointer'}}><b>{c.agenda?.pacientes?.nombre}</b><div style={{fontSize:12,color:'#6b7280',whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{c.mensaje}</div></div>)}{chats.length===0 && <div style={{padding:20,fontSize:12,color:'#6b7280'}}>No hay chats aún. Se crean desde Sala → Médico</div>}</div>
      ) : (
        <>
          <div style={{flex:1,overflowY:'auto',padding:10,display:'flex',flexDirection:'column',gap:6,background:'#f9fafb'}}>
            {msgs.map(m=><div key={m.id} style={{alignSelf:m.de==='medico'?'flex-start':'flex-end',background:m.de==='medico'?'white':'#dcfce7',border:'1px solid #e5e7eb',padding:'8px 12px',borderRadius:14,fontSize:13,maxWidth:'80%'}}>{m.mensaje}</div>)}
          </div>
          <div style={{display:'flex',gap:6,padding:8,borderTop:'1px solid #e5e7eb'}}><input value={txt} onChange={e=>setTxt(e.target.value)} placeholder="Escribe a médico..." style={{flex:1,padding:10,borderRadius:20,border:'1px solid #e5e7eb'}}/><button onClick={enviar} style={{background:'#111827',color:'white',border:0,borderRadius:20,padding:'0 14px'}}>➤</button></div>
        </>
      )}
    </div>
  )
}
