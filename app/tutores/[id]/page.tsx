'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';
import Link from 'next/link';

export default function FichaTutor(){
  const {id}=useParams() as {id:string}; const router=useRouter();
  const [tutor,setTutor]=useState<any>(null); const [mascotas,setMascotas]=useState<any[]>([]);
  const [showForm,setShowForm]=useState(false);
  const [nueva,setNueva]=useState({nombre:'',especie:'canino',raza:'',edad:'',sexo:'Hembra',esterilizado:false});
  const [motivo,setMotivo]=useState(''); const [vets,setVets]=useState<any[]>([]); const [medSel,setMedSel]=useState('');

  async function cargar(){
    const {data:t}=await supabase.from('tutores').select('*').eq('id',id).single(); setTutor(t);
    const {data:m}=await supabase.from('pacientes').select('*').eq('tutor_id',id).order('nombre'); setMascotas(m||[]);
    const {data:v}=await supabase.from('veterinarios').select('*'); setVets(v||[]);
  }
  useEffect(()=>{cargar();},[id]);

  async function guardarMascota(){
    if(!nueva.nombre) return alert('Nombre mascota');
    const {data,error}=await supabase.from('pacientes').insert({
      nombre:nueva.nombre, especie:nueva.especie, raza:nueva.raza,
      edad:nueva.edad?Number(nueva.edad):null, sexo:nueva.sexo==='Hembra'?'H':'M',
      esterilizado:nueva.esterilizado, tutor_id:id
    }).select('id').single();
    if(error) return alert(error.message);
    setShowForm(false); setNueva({nombre:'',especie:'canino',raza:'',edad:'',sexo:'Hembra',esterilizado:false});
    cargar();
  }

  async function ingresarASala(pacienteId:string){
    const mot=prompt('Motivo de asistencia?');
    if(!mot) return;
    await supabase.from('agenda').insert({
      paciente_id:pacienteId, tutor_id:id, veterinario_id:medSel||null,
      resena:mot, estado:'en_espera', fecha_hora:new Date().toISOString(), tipo_ingreso:'ingresado', motivo_consulta:'Consulta'
    });
    router.push('/hoy?v=31');
  }

  if(!tutor) return <div style={{padding:20}}>Cargando tutor...</div>;

  return(
    <div style={{maxWidth:700,margin:'0 auto',padding:16,fontFamily:'system-ui'}}>
      <Link href="/hoy" style={{textDecoration:'none'}}>← Sala</Link>
      <div style={{background:'#111827',color:'white',padding:14,borderRadius:14,marginTop:10}}>
        <div style={{fontWeight:800,fontSize:18}}>{tutor.nombre_completo}</div>
        <div style={{fontSize:12,opacity:0.8}}>{tutor.rut} • {tutor.telefono} {tutor.telefono2? `/ ${tutor.telefono2}`:''} • {tutor.email}</div>
        <div style={{fontSize:11,opacity:0.7}}>{tutor.direccion}</div>
        <div style={{fontSize:11,marginTop:6}}>{mascotas.length} mascotas registradas</div>
      </div>

      {/* BOTÓN EN LUGAR FAVORABLE - justo después del tutor, antes de la lista */}
      <div style={{display:'flex',gap:8,marginTop:12}}>
        <button onClick={()=>setShowForm(!showForm)} style={{flex:1,background:'#16a34a',color:'white',padding:12,borderRadius:10,border:0,fontWeight:800,fontSize:14}}>
          {showForm?'✕ Cancelar':'＋ Nueva mascota para este tutor'}
        </button>
        <select value={medSel} onChange={e=>setMedSel(e.target.value)} style={{padding:10,borderRadius:10,border:'1px solid #e5e7eb',background:'white'}}>
          <option value="">Médico opcional</option>
          {vets.map((v:any)=><option key={v.id} value={v.id}>{v.nombre_completo}</option>)}
        </select>
      </div>

      {showForm && (
        <div style={{background:'white',border:'1px solid #e5e7eb',borderRadius:14,padding:12,marginTop:10}}>
          <b>Nueva mascota para {tutor.nombre_completo.split(' ')[0]}</b>
          <input value={nueva.nombre} onChange={e=>setNueva({...nueva,nombre:e.target.value})} placeholder="Nombre mascota *" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:8}}/>
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <select value={nueva.especie} onChange={e=>setNueva({...nueva,especie:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}><option>canino</option><option>felino</option><option>otro</option></select>
            <input value={nueva.raza} onChange={e=>setNueva({...nueva,raza:e.target.value})} placeholder="Raza" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
          </div>
          <div style={{display:'flex',gap:6,marginTop:6}}>
            <input value={nueva.edad} onChange={e=>setNueva({...nueva,edad:e.target.value})} placeholder="Edad" style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/>
            <select value={nueva.sexo} onChange={e=>setNueva({...nueva,sexo:e.target.value})} style={{flex:1,padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}><option>Hembra</option><option>Macho</option></select>
          </div>
          <label style={{display:'flex',gap:6,marginTop:8,fontSize:13}}><input type="checkbox" checked={nueva.esterilizado} onChange={e=>setNueva({...nueva,esterilizado:e.target.checked})}/> Esterilizado</label>
          <button onClick={guardarMascota} style={{width:'100%',marginTop:10,background:'#111827',color:'white',padding:11,borderRadius:10,fontWeight:700,border:0}}>Guardar mascota</button>
        </div>
      )}

      <div style={{marginTop:16}}>
        <b>🐾 Mascotas de este tutor - progreso clínico</b>
        {mascotas.map(m=>(
          <div key={m.id} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:12,padding:12,marginTop:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div>
              <div style={{fontWeight:800}}>{m.nombre} - {m.especie} {m.raza? `• ${m.raza}`:''}</div>
              <div style={{fontSize:11,color:'#6b7280'}}>{m.sexo==='H'?'Hembra':'Macho'} {m.edad? `• ${m.edad} años`:''} {m.esterilizado?'• Esterilizado':''}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <button onClick={()=>ingresarASala(m.id)} style={{background:'#f59e0b',color:'white',border:0,padding:'8px 12px',borderRadius:999,fontWeight:700,fontSize:12}}>→ Sala</button>
              <Link href={`/pacientes/${m.id}`} style={{background:'#f3f4f6',padding:'6px 10px',borderRadius:999,fontSize:11,textAlign:'center',textDecoration:'none',color:'black'}}>📋 Ficha</Link>
            </div>
          </div>
        ))}
        {mascotas.length===0 && <div style={{fontSize:13,color:'#6b7280',marginTop:8}}>Este tutor aún no tiene mascotas, usa el botón verde de arriba.</div>}
      </div>
    </div>
  );
}
