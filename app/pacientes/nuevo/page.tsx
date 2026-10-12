'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function NuevoCompleto(){
  const router=useRouter();
  const [tutor,setTutor]=useState({nombre_completo:'Bastian Antonio Concha Gajardo',rut:'71795331-6',telefono:'945707501',telefono2:'',email:'bastiancgajardo@gmail.com',direccion:'Aa'});
  const [pac,setPac]=useState({nombre:'Almendra',especie:'canino',raza:'Dachshund',edad:'12',sexo:'Hembra',esterilizado:true});
  const [msg,setMsg]=useState('');

  async function guardar(){
    setMsg('Guardando...');
    try{
      const {data:tNew, error:e1} = await supabase.from('tutores').insert({
        nombre_completo: tutor.nombre_completo,
        rut: tutor.rut,
        telefono: tutor.telefono,
        telefono_whatsapp: tutor.telefono,
        telefono2: tutor.telefono2,
        email: tutor.email,
        direccion: tutor.direccion
      }).select('id').single();
      if(e1) throw e1;

      const {data:pNew, error:e2} = await supabase.from('pacientes').insert({
        nombre: pac.nombre,
        especie: pac.especie.toLowerCase(),
        raza: pac.raza,
        edad: pac.edad? Number(pac.edad): null,
        sexo: pac.sexo === 'Hembra' ? 'H' : 'M',
        esterilizado: pac.esterilizado,
        tutor_id: tNew.id
      }).select('id').single();
      if(e2) throw e2;

      const {data:vet}=await supabase.from('veterinarios').select('id').limit(1).single();
      await supabase.from('agenda').insert({
        paciente_id: pNew.id, tutor_id: tNew.id, veterinario_id: vet?.id,
        motivo_consulta: 'Consulta', resena: 'Nuevo ingreso', tipo_ingreso: 'ingresado', estado: 'en_espera', fecha_hora: new Date().toISOString()
      });
      router.push('/hoy?v=24');
    }catch(err:any){ setMsg(err.message); }
  }

  return(
    <div style={{maxWidth:520,margin:'0 auto',padding:16,fontFamily:'system-ui'}}>
      <h1 style={{fontWeight:800}}>+ Nuevo tutor y paciente</h1>
      <div style={{background:'white',padding:14,borderRadius:14,border:'1px solid #e5e7eb',marginTop:12}}>
        <input value={tutor.nombre_completo} onChange={e=>setTutor({...tutor,nombre_completo:e.target.value})} placeholder="Nombre tutor" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <input value={tutor.rut} onChange={e=>setTutor({...tutor,rut:e.target.value})} placeholder="RUT" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <input value={tutor.telefono} onChange={e=>setTutor({...tutor,telefono:e.target.value})} placeholder="Teléfono 1" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
          <input value={tutor.telefono2} onChange={e=>setTutor({...tutor,telefono2:e.target.value})} placeholder="Teléfono 2" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
        </div>
        <input value={tutor.email} onChange={e=>setTutor({...tutor,email:e.target.value})} placeholder="Correo" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <input value={tutor.direccion} onChange={e=>setTutor({...tutor,direccion:e.target.value})} placeholder="Dirección" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}/>
        <input value={pac.nombre} onChange={e=>setPac({...pac,nombre:e.target.value})} placeholder="Nombre paciente" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:12}}/>
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <select value={pac.especie} onChange={e=>setPac({...pac,especie:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}><option>canino</option><option>felino</option><option>otro</option></select>
          <input value={pac.raza} onChange={e=>setPac({...pac,raza:e.target.value})} placeholder="Raza" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
        </div>
        <div style={{display:'flex',gap:6,marginTop:6}}>
          <input value={pac.edad} onChange={e=>setPac({...pac,edad:e.target.value})} placeholder="Edad" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
          <select value={pac.sexo} onChange={e=>setPac({...pac,sexo:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}><option>Hembra</option><option>Macho</option></select>
        </div>
        <label style={{display:'flex',gap:6,marginTop:8,fontSize:13}}><input type="checkbox" checked={pac.esterilizado} onChange={e=>setPac({...pac,esterilizado:e.target.checked})}/> Esterilizado</label>
        <button onClick={guardar} style={{width:'100%',marginTop:12,background:'#111827',color:'white',padding:12,borderRadius:10,fontWeight:800,border:0}}>Guardar y llevar a sala</button>
        <div style={{fontSize:11,color:'#dc2626',marginTop:8}}>{msg}</div>
      </div>
    </div>
  );
}
