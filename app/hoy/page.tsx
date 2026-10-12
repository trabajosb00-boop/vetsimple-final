'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HoyFinal(){
  const [citas,setCitas]=useState<any[]>([])
  const [q,setQ]=useState('')
  const [toast,setToast]=useState('')
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    if(!localStorage.getItem('vetsimple_admin')){window.location.href='/';return}
    const hoy=new Date(); hoy.setHours(0,0,0,0)
    supabase.from('agenda').select('id,fecha_hora,estado,motivo,pacientes(nombre,especie),tutores(nombre_completo)').gte('fecha_hora',hoy.toISOString()).order('fecha_hora').limit(80).then(({data})=>{setCitas(data||[]); setLoading(false)})
  },[])

  async function mover(id:string,nuevo:string){
    await supabase.from('agenda').update({estado:nuevo}).eq('id',id)
    setToast(nuevo==='en_sala'?'✓ Check-in hecho':nuevo==='en_consulta'?'→ En BOX':'✓ Alta')
    setTimeout(()=>setToast(''),2000)
    const {data}=await supabase.from('agenda').select('id,fecha_hora,estado,motivo,pacientes(nombre,especie),tutores(nombre_completo)').gte('fecha_hora',new Date(new Date().setHours(0,0,0,0)).toISOString()).order('fecha_hora').limit(80)
    setCitas(data||[])
  }

  const filtradas=citas.filter(c=>!q||c.pacientes?.nombre.toLowerCase().includes(q.toLowerCase()))
  const col=(e:string)=>filtradas.filter(c=>c.estado===e)

  return(
    <div style={{minHeight:'100vh',background:'#FFFBF7',fontFamily:'Inter,system-ui'}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');`}</style>
      <div style={{position:'sticky',top:0,background:'rgba(255,251,247,0.8)',backdropFilter:'blur(12px)',borderBottom:'1px solid rgba(0,0,0,0.05)',padding:'16px 24px',display:'flex',justifyContent:'space-between'}}>
        <div style={{display:'flex',gap:24,alignItems:'center'}}>
          <h1 style={{fontSize:28,fontWeight:800,color:'#0F172A'}}>VetSimple</h1>
          <div style={{display:'flex',background:'white',borderRadius:999,padding:4,border:'1px solid rgba(0,0,0,0.05)'}}>
            <span style={{padding:'8px 20px',borderRadius:999,background:'#0F172A',color:'white',fontSize:13,fontWeight:600}}>/HOY</span>
          </div>
        </div>
        <div style={{padding:'8px 16px',background:'white',borderRadius:999,border:'1px solid rgba(0,0,0,0.05)',fontSize:13}}><b>{citas.length} hoy</b> | <b>$540.000</b> | <span style={{color:'#16A34A',fontWeight:700}}>0 no-shows</span></div>
      </div>
      <div style={{maxWidth:1600,margin:'0 auto',padding:24}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." style={{width:'100%',height:60,borderRadius:24,background:'white',border:'1px solid rgba(0,0,0,0.1)',padding:'0 24px',fontSize:16,boxShadow:'0 2px 12px rgba(0,0,0,0.04)'}} />
        <div style={{marginTop:24,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:20}}>
          {['agendada','en_sala','en_consulta','atendida'].map(estado=>(
            <div key={estado} style={{background:estado==='en_sala'?'white':'rgba(243,238,232,0.6)',borderRadius:20,padding:12,border:estado==='en_sala'?'1px solid rgba(0,0,0,0.05)':'none'}}>
              <h3 style={{fontSize:12,fontWeight:700,letterSpacing:1,color:'rgba(15,23,42,0.6)',padding:'8px 12px'}}>{estado.toUpperCase()} · {col(estado).length}</h3>
              <div style={{display:'flex',flexDirection:'column',gap:12,marginTop:8}}>
                {col(estado).map((c:any)=>(
                  <div key={c.id} style={{background:'white',borderRadius:20,padding:16,boxShadow:'0 2px 10px rgba(0,0,0,0.04)',border:'1px solid rgba(0,0,0,0.04)'}}>
                    <div style={{display:'flex',gap:12}}>
                      <div style={{width:48,height:48,borderRadius:14,background:'#FFFBF7',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22}}>{c.pacientes?.especie==='canino'?'🐶':c.pacientes?.especie==='felino'?'🐱':'🐾'}</div>
                      <div><div style={{fontSize:18,fontWeight:700}}>{c.pacientes?.nombre}</div><div style={{fontSize:13,color:'#6b7280'}}>{c.tutores?.nombre_completo}</div></div>
                    </div>
                    <button onClick={()=>mover(c.id, estado==='agendada'?'en_sala':estado==='en_sala'?'en_consulta':'atendida')} style={{width:'100%',marginTop:16,height:60,borderRadius:24,background:estado==='en_sala'?'#16A34A':'#0F172A',color:'white',fontWeight:700,fontSize:14,border:0,cursor:'pointer'}}>{estado==='agendada'?'Check-in → Sala':estado==='en_sala'?'Pasar a BOX':'Dar alta'}</button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast&&<div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#0F172A',color:'white',padding:'12px 24px',borderRadius:999,fontSize:14,fontWeight:600}}>{toast}</div>}
    </div>
  )
}
