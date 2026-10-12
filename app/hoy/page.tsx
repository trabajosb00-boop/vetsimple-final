'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
type Cita = { id:string, fecha_hora:string, estado:string, motivo:string, pacientes?:{nombre:string,especie:string}, tutores?:{nombre_completo:string} }
const EMOJI:any={canino:'🐶',felino:'🐱',otro:'🐾'}
export default function HoyUltra(){
  const [citas,setCitas]=useState<Cita[]>([])
  const [q,setQ]=useState('')
  const [toast,setToast]=useState('')
  const [loading,setLoading]=useState(true)
  const [showNuevo,setShowNuevo]=useState(false)
  const [nuevoTutor,setNuevoTutor]=useState({rut:'',nombre:'',telefono:''})
  const [nuevoPaciente,setNuevoPaciente]=useState({nombre:'',especie:'canino'})
  useEffect(()=>{ if(!localStorage.getItem('vetsimple_admin')){window.location.href='/';return}; cargar()},[])
  async function cargar(){
    setLoading(true)
    const hoy=new Date(); hoy.setHours(0,0,0,0)
    const {data}=await supabase.from('agenda').select('id,fecha_hora,estado,motivo,pacientes(nombre,especie),tutores(nombre_completo,telefono_whatsapp)').gte('fecha_hora',hoy.toISOString()).order('fecha_hora').limit(80)
    setCitas((data as any)||[]); setLoading(false)
  }
  function showToast(m:string){ setToast(m); setTimeout(()=>setToast(''),2500)}
  async function moverEstado(id:string,nuevo:string){
    const {error}=await supabase.from('agenda').update({estado:nuevo}).eq('id',id)
    if(error) showToast(error.message); else { showToast(nuevo==='en_sala'?'✓ Check-in hecho':nuevo==='en_consulta'?'→ En BOX':'✓ Alta dada'); cargar()}
  }
  async function crearTutorYPaciente(){
    if(!nuevoTutor.rut||!nuevoTutor.nombre||!nuevoPaciente.nombre){ showToast('Completa RUT, tutor y mascota'); return}
    const {data:tutorData,error:tutorError}=await supabase.from('tutores').insert({rut:nuevoTutor.rut,nombre_completo:nuevoTutor.nombre,telefono_whatsapp:nuevoTutor.telefono||'+56900000000'}).select().single()
    if(tutorError){ showToast(tutorError.message); return}
    const {data:pacData,error:pacError}=await supabase.from('pacientes').insert({nombre:nuevoPaciente.nombre,especie:nuevoPaciente.especie,tutor_id:tutorData.id}).select().single()
    if(pacError){ showToast(pacError.message); return}
    await supabase.from('agenda').insert({paciente_id:pacData.id,tutor_id:tutorData.id,fecha_hora:new Date().toISOString(),estado:'en_sala',tipo_cita:'consulta',motivo:'Consulta general'})
    setShowNuevo(false); setNuevoTutor({rut:'',nombre:'',telefono:''}); setNuevoPaciente({nombre:'',especie:'canino'}); showToast('✓ Ingresado a sala'); cargar()
  }
  const filtradas=citas.filter(c=>!q||c.pacientes?.nombre.toLowerCase().includes(q.toLowerCase())||c.tutores?.nombre_completo.toLowerCase().includes(q.toLowerCase()))
  const col=(e:string)=>filtradas.filter(c=>c.estado===e)
  const agendadas=[...col('agendada'),...col('confirmada_whatsapp')]
  const enSala=col('en_sala')
  const enConsulta=col('en_consulta')
  const atendidas=col('atendida')
  return(
    <div className="min-h-screen bg-[#FFFBF7]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); *{font-family:Inter,system-ui}`}</style>
      <div className="sticky top-0 z-20 bg-[#FFFBF7]/80 backdrop-blur border-b border-black/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-[28px] font-extrabold tracking-tight text-[#0F172A]">VetSimple</h1>
            <div className="hidden md:flex items-center gap-1 bg-white rounded-full p-1 border border-black/5 shadow-sm">
              <button className="px-5 py-2 rounded-full bg-[#0F172A] text-white text-sm font-semibold">/HOY</button>
              <a href="/box" className="px-5 py-2 rounded-full text-sm font-medium text-[#6b7280] hover:bg-black/5">/BOX</a>
              <a href="/caja" className="px-5 py-2 rounded-full text-sm font-medium text-[#6b7280] hover:bg-black/5">/CAJA</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex gap-3 px-4 py-2 bg-white rounded-full border border-black/5 text-[13px]">
              <span className="font-bold">{citas.length} hoy</span><span className="text-black/20">|</span><span className="font-semibold">$540.000</span><span className="text-black/20">|</span><span className="text-[#16A34A] font-bold">0 no-shows</span>
            </div>
            <button onClick={()=>{localStorage.clear(); window.location.href='/'}} className="w-9 h-9 rounded-full bg-white border border-black/10">↪</button>
          </div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <div className="flex gap-3">
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." className="flex-1 h-[60px] rounded-[24px] bg-white border border-black/10 shadow-[0_2px_12px_rgba(0,0,0,0.04)] px-6 text-[16px] placeholder:text-[#9ca3af] focus:outline-none focus:ring-2 focus:ring-[#0F172A]/10" />
          <button onClick={()=>setShowNuevo(!showNuevo)} className="hidden md:flex h-[60px] px-6 rounded-[24px] bg-[#0F172A] text-white font-bold text-[14px] items-center">+ Nuevo</button>
        </div>
        {showNuevo&&(
          <div className="mt-4 bg-white rounded-[20px] p-5 border border-black/5 shadow-sm max-w-[520px]">
            <p className="font-bold text-[14px] mb-3">Nuevo ingreso rápido</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <input placeholder="RUT Tutor" value={nuevoTutor.rut} onChange={e=>setNuevoTutor({...nuevoTutor,rut:e.target.value})} className="p-3 rounded-[12px] border border-black/10 text-[14px]" />
              <input placeholder="WhatsApp +569" value={nuevoTutor.telefono} onChange={e=>setNuevoTutor({...nuevoTutor,telefono:e.target.value})} className="p-3 rounded-[12px] border border-black/10 text-[14px]" />
              <input placeholder="Nombre Tutor" value={nuevoTutor.nombre} onChange={e=>setNuevoTutor({...nuevoTutor,nombre:e.target.value})} className="p-3 rounded-[12px] border border-black/10 text-[14px] md:col-span-2" />
              <input placeholder="Nombre Mascota" value={nuevoPaciente.nombre} onChange={e=>setNuevoPaciente({...nuevoPaciente,nombre:e.target.value})} className="p-3 rounded-[12px] border border-black/10 text-[14px]" />
              <select value={nuevoPaciente.especie} onChange={e=>setNuevoPaciente({...nuevoPaciente,especie:e.target.value})} className="p-3 rounded-[12px] border border-black/10 text-[14px]"><option value="canino">Canino</option><option value="felino">Felino</option><option value="otro">Otro</option></select>
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={()=>setShowNuevo(false)} className="flex-1 h-[48px] rounded-[14px] border border-black/10 font-semibold">Cancelar</button>
              <button onClick={crearTutorYPaciente} className="flex-1 h-[48px] rounded-[14px] bg-[#16A34A] text-white font-bold">Crear e Ingresar</button>
            </div>
          </div>
        )}
      </div>
      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Column title={`AGENDADOS · ${agendadas.length}`} count={agendadas.length}>{agendadas.map(c=><Card key={c.id} cita={c} onAction={()=>moverEstado(c.id,'en_sala')} label="Check-in → Sala" color="black" />)}{agendadas.length===0&&<Empty label="Sin agendados" />}</Column>
        <Column title={`EN SALA · ${enSala.length}`} count={enSala.length} highlight>{enSala.map(c=><Card key={c.id} cita={c} onAction={()=>moverEstado(c.id,'en_consulta')} label="Pasar a BOX" color="green" alert="Antirrábica vencida" />)}{enSala.length===0&&<Empty label="Sala vacía - busca arriba" />}</Column>
        <Column title={`EN CONSULTA · ${enConsulta.length}`} count={enConsulta.length}>{enConsulta.map(c=><Card key={c.id} cita={c} onAction={()=>moverEstado(c.id,'atendida')} label="Dar alta" color="black" />)}{enConsulta.length===0&&<Empty label="Nadie en consulta" />}</Column>
        <Column title={`LISTOS · ${atendidas.length}`} count={atendidas.length}>{atendidas.map(c=><Card key={c.id} cita={c} onAction={()=>{}} label="Ver ficha" color="white" done />)}{atendidas.length===0&&<Empty label="Nada listo hoy" />}</Column>
      </div>
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-xl z-50">{toast}</div>}
      {loading&&<div className="fixed inset-0 bg-[#FFFBF7]/60 backdrop-blur-sm flex items-center justify-center z-30"><div className="w-8 h-8 rounded-full border-2 border-[#0F172A]/20 border-t-[#0F172A] animate-spin" /></div>}
    </div>
  )
}
function Column({title,count,children,highlight}:any){return(<div className={`rounded-[20px] p-3 ${highlight?'bg-white border border-black/5 shadow-sm':'bg-[#f3eee8]/60'}`}><div className="px-3 py-2 flex items-center justify-between"><h3 className="text-[12px] font-bold tracking-widest text-[#0F172A]/60">{title}</h3><div className={`w-2 h-2 rounded-full ${count>0?'bg-[#16A34A]':'bg-black/10'}`} /></div><div className="flex flex-col gap-3 mt-2">{children}</div></div>)}
function Card({cita,onAction,label,color,alert,done}:any){
  const emoji=EMOJI[cita.pacientes?.especie]||'🐾'
  return(<div className={`group bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 transition-all ${done?'opacity-70':''}`}><div className="flex gap-3"><div className="w-12 h-12 rounded-[14px] bg-[#FFFBF7] border border-black/5 flex items-center justify-center text-[22px] shrink-0">{emoji}</div><div className="flex-1 min-w-0"><div className="flex items-start justify-between gap-2"><h4 className="text-[18px] font-bold leading-tight text-[#0F172A] truncate">{cita.pacientes?.nombre||'Paciente'}</h4>{alert&&!done&&<span className="text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444] px-2 py-1 rounded-full border border-[#EF4444]/10 shrink-0">● {alert}</span>}</div><p className="text-[13px] text-[#6b7280] truncate">{cita.tutores?.nombre_completo||'Tutor'}</p><p className="text-[11px] text-[#9ca3af] mt-1">{new Date(cita.fecha_hora).toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})} • {cita.estado}</p></div></div>{!done&&<button onClick={onAction} className={`w-full mt-4 h-[60px] rounded-[24px] font-bold text-[14px] tracking-wide active:scale-[0.98] ${color==='green'?'bg-[#16A34A] text-white hover:bg-[#15803D] shadow-[0_4px_12px_rgba(22,163,74,0.25)]':color==='black'?'bg-[#0F172A] text-white hover:bg-black':'bg-white border border-black/10 text-[#0F172A]'}`}>{label}</button>}</div>)
}
function Empty({label}:any){return<div className="bg-white/60 border border-dashed border-black/10 rounded-[20px] p-8 text-center text-[13px] text-[#9ca3af]">{label}</div>}
