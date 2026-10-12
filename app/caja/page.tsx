
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cita = { id:string, fecha_hora:string, estado:string, motivo:string, pacientes?:{nombre:string,especie:string}, tutores?:{nombre_completo:string} }
const EMOJI:any={canino:'🐶',felino:'🐱',otro:'🐾'}

export default function HoyUltra(){
  const [citas,setCitas]=useState<Cita[]>([])
  const [q,setQ]=useState('')
  const [toast,setToast]=useState('')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    if(!localStorage.getItem('vetsimple_admin')){window.location.href='/';return}
    cargar()
  },[])

  async function cargar(){
    setLoading(true)
    const hoy=new Date(); hoy.setHours(0,0,0,0)
    const {data}=await supabase.from('agenda').select('id,fecha_hora,estado,motivo,pacientes(nombre,especie),tutores(nombre_completo)').gte('fecha_hora',hoy.toISOString()).order('fecha_hora').limit(60)
    setCitas((data as any)||[]); setLoading(false)
  }
  function showToast(m:string){setToast(m);setTimeout(()=>setToast(''),2500)}
  async function mover(id:string,nuevo:string){
    await supabase.from('agenda').update({estado:nuevo}).eq('id',id)
    showToast(nuevo==='en_sala'?'✓ Check-in':'→ En BOX')
    cargar()
  }

  const filtradas=citas.filter(c=>!q||c.pacientes?.nombre.toLowerCase().includes(q.toLowerCase())||c.tutores?.nombre_completo.toLowerCase().includes(q.toLowerCase()))
  const col=(e:string)=>filtradas.filter(c=>c.estado===e)

  return(
    <div className="min-h-screen bg-[#FFFBF7]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');*{font-family:Inter}`}</style>
      <div className="sticky top-0 z-20 bg-[#FFFBF7]/80 backdrop-blur border-b border-black/5">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex gap-6 items-center">
            <h1 className="text-[28px] font-extrabold text-[#0F172A]">VetSimple</h1>
            <div className="hidden md:flex bg-white rounded-full p-1 border border-black/5">
              <span className="px-5 py-2 rounded-full bg-[#0F172A] text-white text-sm font-semibold">/HOY</span>
              <a href="/box" className="px-5 py-2 rounded-full text-sm text-[#6b7280]">/BOX</a>
              <a href="/caja" className="px-5 py-2 rounded-full text-sm text-[#6b7280]">/CAJA</a>
            </div>
          </div>
          <div className="hidden md:flex gap-3 px-4 py-2 bg-white rounded-full border text-[13px]"><b>{citas.length} hoy</b><span>|</span><b>$540.000</b><span>|</span><span className="text-[#16A34A] font-bold">0 no-shows</span></div>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-6 pt-6">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." className="w-full h-[60px] rounded-[24px] bg-white border border-black/10 shadow px-6 text-[16px] focus:outline-none" />
      </div>
      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Col title={`AGENDADOS · ${col('agendada').length}`}><>{col('agendada').map(c=><Card key={c.id} cita={c} action={()=>mover(c.id,'en_sala')} label="Check-in → Sala" color="black" />)}</></Col>
        <Col title={`EN SALA · ${col('en_sala').length}`} highlight><>{col('en_sala').map(c=><Card key={c.id} cita={c} action={()=>mover(c.id,'en_consulta')} label="Pasar a BOX" color="green" alert="Antirrábica vencida" />)}</></Col>
        <Col title={`EN CONSULTA · ${col('en_consulta').length}`}><>{col('en_consulta').map(c=><Card key={c.id} cita={c} action={()=>mover(c.id,'atendida')} label="Dar alta" color="black" />)}</></Col>
        <Col title={`LISTOS · ${col('atendida').length}`}><>{col('atendida').map(c=><Card key={c.id} cita={c} action={()=>{}} label="Ver ficha" color="white" done />)}</></Col>
      </div>
      {toast&&<div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-6 py-3 rounded-full text-sm font-semibold shadow-xl">{toast}</div>}
    </div>
  )
}
function Col({title,children,highlight}:any){return<div className={`rounded-[20px] p-3 ${highlight?'bg-white border shadow-sm':'bg-[#f3eee8]/60'}`}><h3 className="text-[12px] font-bold tracking-widest text-[#0F172A]/60 px-3 py-2">{title}</h3><div className="flex flex-col gap-3 mt-2">{children}</div></div>}
function Card({cita,action,label,color,alert,done}:any){
  const emoji=EMOJI[cita.pacientes?.especie]||'🐾'
  return<div className="bg-white rounded-[20px] p-4 shadow-[0_2px_10px_rgba(0,0,0,0.04)] border border-black/[0.04] hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all">
    <div className="flex gap-3"><div className="w-12 h-12 rounded-[14px] bg-[#FFFBF7] border flex items-center justify-center text-[22px]">{emoji}</div><div className="flex-1 min-w-0"><div className="flex justify-between"><h4 className="text-[18px] font-bold truncate">{cita.pacientes?.nombre}</h4>{alert&&<span className="text-[10px] font-bold bg-[#FEF2F2] text-[#EF4444] px-2 py-1 rounded-full">● {alert}</span>}</div><p className="text-[13px] text-[#6b7280] truncate">{cita.tutores?.nombre_completo}</p></div></div>
    {!done&&<button onClick={action} className={`w-full mt-4 h-[60px] rounded-[24px] font-bold text-[14px] ${color==='green'?'bg-[#16A34A] text-white shadow-[0_4px_12px_rgba(22,163,74,0.25)]':'bg-[#0F172A] text-white'}`}>{label}</button>}
  </div>
}
