'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function NuevoCompleto(){
  const router=useRouter();
  const [tutor,setTutor]=useState({nombre_completo:'',rut:'',telefono:'',telefono2:'',email:'',direccion:''});
  const [pac,setPac]=useState({nombre:'',especie:'canino',raza:'',edad:'',sexo:'Macho',esterilizado:false});
  const [msg,setMsg]=useState('');

  async function guardar(){
    if(!tutor.nombre_completo || !pac.nombre) return alert('Falta nombre tutor y paciente');
    setMsg('Guardando...');
    // crea tutor
    const {data:tNew, error:e1} = await supabase.from('tutores').insert({
      nombre_completo: tutor.nombre_completo,
      rut: tutor.rut,
      telefono: tutor.telefono,
      telefono2: tutor.telefono2,
      email: tutor.email,
      direccion: tutor.direccion
    }).select('id').single();
    if(e1){ setMsg(e1.message); return; }
    // crea paciente
    const {data:pNew, error:e2} = await supabase.from('pacientes').insert({
      nombre: pac.nombre,
      especie: pac.especie,
      raza: pac.raza,
      edad: pac.edad? Number(pac.edad) : null,
      sexo: pac.sexo,
      esterilizado: pac.esterilizado,
      tutor_id: tNew.id
    }).select('id').single();
    if(e2){ setMsg(e2.message); return; }
    // lo mete a sala como Ingresado con reseña vacía
    const {data:vet}=await supabase.from('veterinarios').select('id').limit(1).single();
    await supabase.from('agenda').insert({
      paciente_id: pNew.id,
      tutor_id: tNew.id,
      veterinario_id: vet?.id,
      motivo_consulta: 'Consulta',
      resena: 'Nuevo - sin reseña',
      tipo_ingreso: 'ingresado',
      estado: 'en_espera',
      fecha_hora: new Date().toISOString()
    });
    router.push('/hoy?v=20');
  }

  return(
    <div style={{maxWidth:520,margin:'0 auto',padding:16,fontFamily:'system-ui'}}>
      <h1 style={{fontWeight:800}}>+ Nuevo tutor y paciente</h1>
      <div style={{background:'white',padding:14,borderRadius:14,border:'1px solid #e5e7eb',marginTop:12}}>
        <b>Tutor</b>
        <input placeholder="Nombre completo tutor *" value={tutor.nombre_completo} onChange={e=>setTutor({...tutor,nombre_completo:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <input placeholder="RUT Ej: 12.345.678-9" value={tutor.rut} onChange={e=>setTutor({...tutor,rut:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <input placeholder="Teléfono 1 *" value={tutor.telefono} onChange={e=>setTutor({...tutor,telefono:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
          <input placeholder="Teléfono 2" value={tutor.telefono2} onChange={e=>setTutor({...tutor,telefono2:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
        </div>
        <input placeholder="Correo" value={tutor.email} onChange={e=>setTutor({...tutor,email:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <input placeholder="Dirección" value={tutor.direccion} onChange={e=>setTutor({...tutor,direccion:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>

        <b style={{display:'block',marginTop:14}}>Paciente</b>
        <input placeholder="Nombre paciente *" value={pac.nombre} onChange={e=>setPac({...pac,nombre:e.target.value})} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <select value={pac.especie} onChange={e=>setPac({...pac,especie:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}><option>canino</option><option>felino</option><option>otro</option></select>
          <input placeholder="Raza" value={pac.raza} onChange={e=>setPac({...pac,raza:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
        </div>
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <input placeholder="Edad años" type="number" value={pac.edad} onChange={e=>setPac({...pac,edad:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
          <select value={pac.sexo} onChange={e=>setPac({...pac,sexo:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}><option>Macho</option><option>Hembra</option></select>
        </div>
        <label style={{display:'flex',alignItems:'center',gap:6,marginTop:8,fontSize:13}}><input type="checkbox" checked={pac.esterilizado} onChange={e=>setPac({...pac,esterilizado:e.target.checked})}/> Esterilizado</label>

        <button onClick={guardar} style={{width:'100%',marginTop:14,background:'#111827',color:'white',padding:12,borderRadius:10,fontWeight:800,border:0}}>Guardar y llevar a sala</button>
        <div style={{fontSize:11,color:'#6b7280',marginTop:6}}>{msg}</div>
      </div>
    </div>
  );
}
