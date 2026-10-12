'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export default function HoyPage(){
  const [citas,setCitas]=useState<any[]>([])
  const [q,setQ]=useState('')
  
  async function cargar(){
    const {data}=await supabase.from('agenda').select('*, pacientes(nombre,especie), tutores(nombre_completo,telefono_whatsapp)').eq('estado','en_espera').order('fecha_hora',{ascending:true})
    setCitas(data||[])
  }
  useEffect(()=>{cargar()},[])

  const filtradas = citas.filter(c=> 
    c.pacientes?.nombre?.toLowerCase().includes(q.toLowerCase()) || 
    c.tutores?.nombre_completo?.toLowerCase().includes(q.toLowerCase())
  )

  return(
    <div style={{padding:16,fontFamily:'system-ui',background:'#f6f7f9',minHeight:'100vh'}}>
      <h1 style={{fontWeight:800}}>Sala de Espera</h1>
      <div style={{background:'white',padding:12,borderRadius:12,border:'1px solid #e5e7eb',marginTop:10}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="🔍 Buscar paciente o tutor (RUT/teléfono) para ingresar..." style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
        <div style={{marginTop:10,padding:10,borderRadius:8,border:'1px solid #ddd',color:'#888',fontSize:14}}>Médico opcional - queda en blanco</div>
        <button style={{width:'100%',marginTop:10,padding:12,borderRadius:10,background:'#111',color:'white',fontWeight:700}}>+ Nuevo paciente/tutor</button>
      </div>
      {filtradas.map(c=>(
        <div key={c.id} style={{background:'white',padding:14,borderRadius:12,marginTop:12,border:'1px solid #e5e7eb'}}>
          <b>{c.pacientes?.nombre}</b> - {c.tutores?.nombre_completo}
          <div style={{fontSize:12,color:'#666'}}>{c.tutores?.telefono_whatsapp} • {c.motivo}</div>
        </div>
      ))}
      {filtradas.length===0 && <p style={{textAlign:'center',color:'#888',marginTop:20}}>No hay pacientes en espera</p>}
    </div>
  )
}
