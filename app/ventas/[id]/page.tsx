'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
export default function Ventas(){
  const {id}=useParams() as {id:string}; const router=useRouter();
  const [agenda,setAgenda]=useState<any>(null); const [procs,setProcs]=useState<any[]>([]); const [items,setItems]=useState<any[]>([]); const [ventaId,setVentaId]=useState('');
  useEffect(()=>{(async()=>{
    const {data:a}=await supabase.from('agenda').select('*, pacientes(nombre), tutores(nombre_completo,telefono)').eq('id',id).single(); setAgenda(a);
    const {data:p}=await supabase.from('procedimientos').select('*'); setProcs(p||[]);
    const {data:v}=await supabase.from('ventas').select('*').eq('agenda_id',id).limit(1).single();
    let vId=v?.id; if(!vId){const {data:nv}=await supabase.from('ventas').insert({agenda_id:id,paciente_id:a?.paciente_id,tutor_id:a?.tutor_id}).select('id').single(); vId=nv?.id;} setVentaId(vId);
    const {data:its}=await supabase.from('ventas_items').select('*').eq('venta_id',vId); setItems(its||[]);
  })();},[id]);
  async function addItem(proc:any){await supabase.from('ventas_items').insert({venta_id:ventaId,nombre:proc.nombre,precio:proc.precio}); const {data:its}=await supabase.from('ventas_items').select('*').eq('venta_id',ventaId); setItems(its||[]);}
  const total=items.reduce((s,i)=>s+i.precio,0);
  async function cobrar(){await supabase.from('ventas').update({total,estado:'pagado'}).eq('id',ventaId); await supabase.from('agenda').update({estado:'atendida'}).eq('id',id); router.push('/hoy');}
  if(!agenda) return <div style={{padding:20}}>Cargando...</div>;
  return(<div style={{maxWidth:600,margin:'0 auto',padding:16,fontFamily:'system-ui'}}><button onClick={()=>router.push('/hoy')} style={{border:'1px solid #e5e7eb',background:'white',padding:'8px 12px',borderRadius:999}}>← Sala</button><div style={{background:'#111827',color:'white',padding:12,borderRadius:12,marginTop:10}}><b>{agenda.pacientes?.nombre}</b> - {agenda.tutores?.nombre_completo}<br/><span style={{fontSize:12}}>{agenda.resena}</span></div><div style={{background:'white',padding:12,borderRadius:12,border:'1px solid #e5e7eb',marginTop:12}}>{procs.map(p=><button key={p.id} onClick={()=>addItem(p)} style={{padding:'8px 10px',borderRadius:999,border:'1px solid #e5e7eb',margin:4}}>{p.nombre} ${p.precio}</button>)}<div style={{marginTop:12}}>{items.map(i=><div key={i.id} style={{display:'flex',justifyContent:'space-between',borderBottom:'1px solid #f3f4f6',padding:'6px 0'}}><span>{i.nombre}</span><span>${i.precio}</span></div>)}<div style={{display:'flex',justifyContent:'space-between',fontWeight:800,marginTop:10}}><span>Total</span><span>${total}</span></div><button onClick={cobrar} style={{width:'100%',marginTop:12,background:'#16a34a',color:'white',padding:12,borderRadius:10,fontWeight:800}}>Cobrar</button></div></div></div>);
}
