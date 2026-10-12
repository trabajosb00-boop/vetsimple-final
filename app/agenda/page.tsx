'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';
export default function Agenda(){
  const [fecha,setFecha]=useState(new Date().toISOString().split('T')[0]);
  const [citas,setCitas]=useState<any[]>([]);
  async function cargar(){
    const {data}=await supabase.from('agenda').select('*, pacientes(nombre), tutores(nombre_completo), veterinarios(nombre_completo)').gte('fecha_hora',fecha+'T00:00:00').lte('fecha_hora',fecha+'T23:59:59').order('fecha_hora');
    setCitas(data||[]);
  }
  useEffect(()=>{cargar();},[fecha]);
  return(<div style={{maxWidth:700,margin:'0 auto',padding:16,fontFamily:'system-ui',background:'#f8fafc',minHeight:'100vh'}}>
    <h1 style={{fontWeight:800}}>Agenda - {fecha}</h1>
    <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)} style={{width:'100%',padding:12,borderRadius:12,border:'1px solid #e5e7eb',marginTop:10}}/>
    {citas.length===0 && <div style={{marginTop:20,color:'#6b7280',textAlign:'center'}}>Sin citas este día. Crea desde Sala → Agendado.</div>}
    {citas.map(c=><div key={c.id} style={{background:'white',borderRadius:12,padding:12,marginTop:10,border:'1px solid #e5e7eb',borderLeft:'5px solid #2563eb'}}><b>{new Date(c.fecha_hora).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} - {c.pacientes?.nombre}</b><div style={{fontSize:12}}>{c.tutores?.nombre_completo} • {c.resena}</div></div>)}
    <Link href="/hoy" style={{display:'block',marginTop:16,textAlign:'center',background:'#111827',color:'white',padding:12,borderRadius:12,textDecoration:'none'}}>← Volver a Sala</Link>
  </div>)
}
