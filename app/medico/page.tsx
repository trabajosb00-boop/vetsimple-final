'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
export default function VistaMedico(){
  const [citas,setCitas]=useState<any[]>([]); const router=useRouter();
  async function cargar(){const {data}=await supabase.from('agenda').select('*, pacientes(nombre,especie), tutores(nombre_completo)').in('estado',['ingresado','en_espera','en_atencion']).order('fecha_hora'); setCitas(data||[]);}
  useEffect(()=>{cargar();},[]);
  return(<div style={{maxWidth:700,margin:'0 auto',padding:16,fontFamily:'system-ui'}}><h1 style={{fontWeight:800}}>🩺 Mis pacientes en sala</h1>{citas.map(c=><div key={c.id} style={{background:'white',borderLeft:'5px solid #2563eb',border:'1px solid #e5e7eb',borderRadius:12,padding:12,marginTop:10}}><b>{c.pacientes?.nombre}</b> - {c.resena}<br/><span style={{fontSize:11}}>{c.tutores?.nombre_completo}</span><div style={{display:'flex',gap:8,marginTop:8}}><button onClick={()=>router.push(`/pacientes/${c.paciente_id}`)} style={{flex:1,background:'#2563eb',color:'white',padding:10,borderRadius:999,border:0,fontWeight:700}}>Abrir ficha y atender</button></div></div>)}</div>);
}
