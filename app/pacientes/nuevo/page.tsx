'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
export default function Nuevo(){
  const router=useRouter();
  const [tutor,setTutor]=useState({nombre_completo:'',telefono:'',email:''});
  const [pac,setPac]=useState({nombre:'',especie:'canino',raza:''});
  async function guardar(){
    const {data:t}=await supabase.from('tutores').insert({nombre_completo:tutor.nombre_completo,telefono:tutor.telefono,email:tutor.email}).select('id').single();
    const tutorId=t?.id;
    const {data:p}=await supabase.from('pacientes').insert({nombre:pac.nombre,especie:pac.especie,raza:pac.raza,tutor_id:tutorId}).select('id').single();
    const {data:vet}=await supabase.from('veterinarios').select('id').limit(1).single();
    await supabase.from('agenda').insert({paciente_id:p?.id,tutor_id:tutorId,veterinario_id:vet?.id,motivo_consulta:'Consulta',resena:'Nuevo ingreso',tipo_ingreso:'ingresado',estado:'en_espera',fecha_hora:new Date().toISOString()});
    router.push('/hoy');
  }
  return(<div style={{maxWidth:500,margin:'0 auto',padding:16,fontFamily:'system-ui'}}><h1 style={{fontWeight:800}}>+ Nuevo</h1><div style={{background:'white',padding:12,borderRadius:14,border:'1px solid #e5e7eb',marginTop:12}}><input placeholder="Tutor nombre" value={tutor.nombre_completo} onChange={e=>setTutor({...tutor,nombre_completo:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginBottom:6}}/><input placeholder="WhatsApp" value={tutor.telefono} onChange={e=>setTutor({...tutor,telefono:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginBottom:6}}/><input placeholder="Mascota nombre" value={pac.nombre} onChange={e=>setPac({...pac,nombre:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/><button onClick={guardar} style={{width:'100%',marginTop:10,background:'#111827',color:'white',padding:12,borderRadius:10,fontWeight:800}}>Guardar y llevar a sala</button></div></div>);
}
