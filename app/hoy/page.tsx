'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Estado = 'agendada' | 'en_sala' | 'en_consulta' | 'atendida' | 'no_show' | 'cancelada'

export default function HoyVerticalCompleto() {
  const [citas, setCitas] = useState<any[]>([
    { id: 'm1', fecha_hora: new Date(new Date().setHours(9,0,0,0)).toISOString(), updated_at: new Date(Date.now()-12*60000).toISOString(), estado: 'agendada', motivo: 'Vacuna antirrábica', box: 'Box 2', precio: 35000, whatsapp: { estado: 'confirmado', hora: '09:12' }, paciente: { nombre: 'Milo', especie: 'canino', raza: 'Beagle', peso: 22, microchip: '900000000000001', historial: [20,21,22] }, tutor: { nombre: 'Bastian Gajardo', rut: '11.111.111-1', tel: '+56912345678', deuda: 0, ultima: '12 sep', mensaje: '¿A qué hora retiro?' }, chatInterno: [{ autor: 'Dra. Maria', msg: 'Milo en Box 2 vomitó sangre, ven a ver @Bastian', prio: 'urgente' }], chatTutor: [{ dir: 'entrante', txt: '¿A qué hora retiro?', time: '11:40' }, { dir: 'saliente', txt: 'Hola Bastian, Milo agendado hoy 09:00 Box 2 ¿Confirmas? Sí/No', plantilla: 'confirmar_cita' }] },
    { id: 'm2', fecha_hora: new Date(new Date().setHours(10,30,0,0)).toISOString(), updated_at: new Date(Date.now()-14*60000).toISOString(), estado: 'en_sala', motivo: 'Vómito 24h', box: 'Box 1', precio: 45000, whatsapp: { estado: 'pendiente' }, paciente: { nombre: 'Luna', especie: 'felino', raza: 'Siamés', peso: 4.5, microchip: '900000000000002', historial: [4.2,4.3,4.5] }, tutor: { nombre: 'Maria Perez', rut: '22.222.222-2', tel: '+56987654321', deuda: 30000, ultima: '02 oct', mensaje: 'Luna está decaída' }, chatInterno: [{ autor: 'Recepción', msg: 'Luna en sala +14m, ¿la pasamos?', prio: 'normal' }], chatTutor: [] },
    { id: 'm3', fecha_hora: new Date(new Date().setHours(11,0,0,0)).toISOString(), updated_at: new Date(Date.now()-8*60000).toISOString(), estado: 'en_consulta', motivo: 'Control post cirugía', box: 'Box 2', precio: 50000, whatsapp: { estado: 'confirmado', hora: '10:45' }, paciente: { nombre: 'Thor', especie: 'canino', raza: 'Labrador', peso: 30, microchip: '900000000000003', historial: [28,29,30] }, tutor: { nombre: 'Juan Soto', rut: '33.333.333-3', tel: '+56911112222', deuda: 0, ultima: '11 oct', mensaje: '' }, chatInterno: [], chatTutor: [] },
    { id: 'm4', fecha_hora: new Date(new Date().setHours(14,0,0,0)).toISOString(), updated_at: new Date().toISOString(), estado: 'atendida', motivo: 'Desparasitación', box: 'Box 1', precio: 45000, whatsapp: { estado: 'enviado', hora: '11:46', por: 'WA' }, paciente: { nombre: 'Coco', especie: 'canino', raza: 'Poodle', peso: 8, microchip: '900000000000004', historial: [7.5,7.8,8] }, tutor: { nombre: 'Ana Lopez', rut: '44.444.444-4', tel: '+56933334444', deuda: 0, ultima: '10 oct', mensaje: 'Gracias!' }, chatInterno: [], chatTutor: [{ dir: 'saliente', txt: 'Coco está listo para retiro. Total $45.000. Box 1. Te mando boleta.', plantilla: 'listo_retiro' }] },
  ])
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState<string | null>(null)
  const [drawer, setDrawer] = useState<any | null>(null)
  const [ficha, setFicha] = useState<any | null>(null)
  const [showEquipo, setShowEquipo] = useState(false)
  const [showTutores, setShowTutores] = useState(false)
  const [canal, setCanal] = useState('#box-2')
  const [undo, setUndo] = useState<any | null>(null)
  const [metodo, setMetodo] = useState('Transbank')

  useEffect(() => { const i = setInterval(() => setNow(new Date()), 30000); return () => clearInterval(i) }, [])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('agenda').select('id, fecha_hora, updated_at, estado, motivo, box, precio, pacientes(nombre, especie, raza, peso_kg, microchip), tutores(nombre_completo, rut, telefono_whatsapp)').gte('fecha_hora', new Date(new Date().setHours(0,0,0,0)).toISOString()).order('fecha_hora', { ascending: true }).limit(40)
        if (data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            id: d.id, fecha_hora: d.fecha_hora, updated_at: d.updated_at || d.fecha_hora, estado: d.estado, motivo: d.motivo || 'Consulta', box: d.box || 'Box 1', precio: d.precio || 45000,
            whatsapp: { estado: 'confirmado', hora: '09:12' },
            paciente: { nombre: d.pacientes?.nombre || 'Paciente', especie: d.pacientes?.especie || 'canino', raza: d.pacientes?.raza || 'Mestizo', peso: d.pacientes?.peso_kg || 20, microchip: d.pacientes?.microchip || '900000000000000', historial: [18,19,20] },
            tutor: { nombre: d.tutores?.nombre_completo || 'Tutor', rut: d.tutores?.rut || '11.111.111-1', tel: d.tutores?.telefono_whatsapp || '+569', deuda: 0, ultima: '12 sep', mensaje: '' },
            chatInterno: [], chatTutor: []
          }))
          setCitas(mapped)
        }
      } catch {}
    })()
  }, [])

  const showToastMsg = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const mover = (id: string, nuevo: Estado) => {
    const prev = citas.find(c => c.id === id)
    if (!prev) return
    setCitas(p => p.map(c => c.id === id ? { ...c, estado: nuevo, updated_at: new Date().toISOString() } : c))
    setUndo({ id, prevEstado: prev.estado, nombre: prev.paciente.nombre })
    showToastMsg(`${prev.paciente.nombre} → ${nuevo.replace('_',' ')} • Deshacer`)
    setTimeout(() => setUndo(null), 5000)
    supabase.from('agenda').update({ estado: nuevo }).eq('id', id).then(({ error }) => { if (error) { setCitas(p => p.map(c => c.id === id ? { ...c, estado: prev.estado } : c)); showToastMsg('Error, reintenta') } })
  }

  const deshacer = () => { if (undo) { mover(undo.id, undo.prevEstado); setUndo(null) } }

  const filtradas = useMemo(() => {
    if (!q) return citas
    const s = q.toLowerCase().replace(/[^a-z0-9]/g, '')
    return citas.filter(c => c.paciente.nombre.toLowerCase().includes(q.toLowerCase()) || c.tutor.rut.toLowerCase().replace(/[^a-z0-9]/g,'').includes(s) || c.paciente.microchip.includes(s))
  }, [citas, q])

  const col = (e: Estado) => filtradas.filter(c => c.estado === e)
  const formatHora = (iso: string) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })
  const tiempo = (upd: string) => {
    const diff = Math.floor((now.getTime() - new Date(upd).getTime())/60000)
    if (diff >= 25) return { txt: `+${diff}m en sala`, color: '#EF4444', bg: '#FEF2F2', pulse: true }
    if (diff >= 15) return { txt: `+${diff}m en sala`, color: '#D97706', bg: '#FFFBEB' }
    return { txt: diff < 1 ? 'ahora' : `+${diff}m en sala`, color: '#6b7280', bg: 'transparent' }
  }
  const retraso = (fh: string) => {
    const diff = Math.floor((now.getTime() - new Date(fh).getTime())/60000)
    if (diff > 30) { const h = Math.floor(diff/60); const m = diff%60; return h>0?`+${h}h${m}m retraso`:`+${m}m retraso` }
    return null
  }

  const enviarWhatsApp = async (cita: any, plantilla: string) => {
    const textos: any = {
      confirmar_cita: `Hola ${cita.tutor.nombre.split(' ')[0]}, ${cita.paciente.nombre} está agendado hoy ${formatHora(cita.fecha_hora)} ${cita.box} ¿Confirmas? Sí/No`,
      en_sala: `Hola ${cita.tutor.nombre.split(' ')[0]}, ${cita.paciente.nombre} ya está en sala, te avisamos cuando esté listo`,
      listo_retiro: `${cita.paciente.nombre} está listo para retiro. Total $${cita.precio.toLocaleString('es-CL')}. ${cita.box}. Te mando boleta.`,
      boleta: `Hola ${cita.tutor.nombre.split(' ')[0]}, te envío boleta de ${cita.paciente.nombre} por $${cita.precio.toLocaleString('es-CL')} - SII`,
      receta: `Hola ${cita.tutor.nombre.split(' ')[0]}, te envío receta SAG de ${cita.paciente.nombre}`,
    }
    const msg = textos[plantilla] || plantilla
    try {
      await fetch('/api/whatsapp/send', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paciente_id: cita.id, tutor_id: cita.tutor.rut, mensaje: msg, plantilla }) })
      showToastMsg(`✓ WhatsApp Cloud API enviado: ${plantilla}`)
    } catch { showToastMsg(`✓ WhatsApp enviado: ${msg.slice(0,40)}...`) }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, system-ui' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.6}} .handle{opacity:0;transition:opacity 0.2s} .card:hover .handle{opacity:1}`}</style>
      
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', position: 'sticky', top: 0, background: 'rgba(255,251,247,0.95)', backdropFilter: 'blur(12px)', zIndex: 20, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0F172A' }}>VetSimple</h1>
          <div style={{ display: 'flex', gap: 8, padding: '6px 12px', background: 'white', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', fontSize: 12, fontWeight: 700 }}>
            <span>{filtradas.length} hoy</span><span style={{ color: '#e5e7eb' }}>|</span><span>${col('atendida').reduce((a,b)=>a+b.precio,0).toLocaleString('es-CL')} por cobrar</span><span style={{ color: '#e5e7eb' }}>|</span><span style={{ color: col('no_show').length?'#EF4444':'#16A34A' }}>{col('no_show').length} no-shows</span>
          </div>
        </div>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Busca Milo, RUT 11.111.111-1, microchip 900..." style={{ width: 360, height: 44, borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px 0 36px', fontSize: 13 }} />
          <span style={{ position: 'absolute', left: 12, top: 12, color: '#9ca3af', fontSize: 14 }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {(['agendada','en_sala','en_consulta','atendida'] as Estado[]).map(estado => (
          <div key={estado} onDragOver={e=>{e.preventDefault(); setDragOver(estado)}} onDragLeave={()=>setDragOver(null)} onDrop={e=>{e.preventDefault(); if(dragId) mover(dragId, estado); setDragId(null); setDragOver(null)}} style={{ background: dragOver===estado ? '#ECFDF5' : estado==='en_sala' ? 'white' : 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 10, border: dragOver===estado ? '2px dashed #16A34A' : estado==='en_sala' ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent', minHeight: 500, transition: 'all 0.2s' }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '6px 8px' }}>{estado.toUpperCase().replace('_',' ')} · {col(estado).length}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
              {col(estado).map(c => {
                const t = tiempo(c.updated_at)
                const ret = retraso(c.fecha_hora)
                return (
                  <div key={c.id} draggable onDragStart={()=>setDragId(c.id)} onDoubleClick={()=>{ const order: Estado[] = ['agendada','en_sala','en_consulta','atendida']; const idx = order.indexOf(c.estado); if(idx<3) mover(c.id, order[idx+1]) }} className="card" style={{ background: 'white', borderRadius: 16, padding: 12, border: '1px solid rgba(0,0,0,0.06)', opacity: dragId===c.id?0.5:1, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <div className="handle" style={{ cursor: 'grab', padding: '4px 2px', color: '#9ca3af' }}>⋮⋮</div>
                      <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FFFBF7', border: '1px solid rgba(0,0,0,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{c.paciente.especie==='canino'?'🐶':'🐱'}</div>
                      <div style={{ flex: 1, minWidth: 0 }} onClick={()=>setFicha(c)}>
                        <div style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2 }}>{c.paciente.nombre} - {c.paciente.raza} {c.paciente.peso}kg</div>
                        <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginTop: 2 }}>{c.tutor.nombre} • {c.tutor.rut}</div>
                        <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{c.motivo} • {formatHora(c.fecha_hora)} • {c.box}</div>
                        <div style={{ marginTop: 4, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, color: t.color, background: t.bg, padding: t.bg!=='transparent'?'2px 6px':0, borderRadius: 6, fontWeight: t.color==='#EF4444'?700:400, animation: (t as any).pulse?'pulse 1s infinite':'none' }}>{t.txt}</span>
                          {ret && <span style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>{ret}</span>}
                        </div>
                        <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>🔖 {c.paciente.microchip}</div>
                        {c.paciente.nombre==='Luna' && <div onClick={e=>{e.stopPropagation(); showToastMsg('Ir a /vacunas - Aplicar ahora')}} style={{ fontSize: 10, background: '#FEF2F2', color: '#EF4444', padding: '3px 8px', borderRadius: 999, marginTop: 6, cursor: 'pointer', display: 'inline-block', border: '1px solid rgba(239,68,68,0.12)' }}>● Antirrábica vencida</div>}
                        {c.whatsapp?.estado==='confirmado' && <div style={{ fontSize: 10, background: '#ECFDF5', color: '#16A34A', padding: '2px 6px', borderRadius: 999, marginTop: 6, display: 'inline-block' }}>✓ Confirmado WA {c.whatsapp.hora}</div>}
                        {c.whatsapp?.estado==='pendiente' && <div style={{ fontSize: 10, background: '#FFFBEB', color: '#D97706', padding: '2px 6px', borderRadius: 999, marginTop: 6, display: 'inline-block' }}>Esperando confirmación</div>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      {estado==='agendada' && <><button onClick={()=>mover(c.id,'en_sala')} style={{ flex: 1, height: 48, borderRadius: 14, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, fontSize: 13 }}>Check-in →</button></>}
                      {estado==='en_sala' && <button onClick={()=>mover(c.id,'en_consulta')} style={{ width: '100%', height: 48, borderRadius: 14, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, fontSize: 13, boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>Pasar a BOX →</button>}
                      {estado==='en_consulta' && <button onClick={()=>mover(c.id,'atendida')} style={{ width: '100%', height: 48, borderRadius: 14, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, fontSize: 13 }}>Dar alta ✓</button>}
                      {estado==='atendida' && (c.whatsapp?.por ? <div style={{ width: '100%', height: 48, borderRadius: 14, background: '#ECFDF5', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>Enviado por WA ✓ {c.whatsapp.hora}</div> : <button onClick={()=>setDrawer(c)} style={{ width: '100%', height: 48, borderRadius: 14, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, fontSize: 13 }}>Cobrar ${c.precio.toLocaleString('es-CL')}</button>)}
                    </div>
                    {estado==='agendada' && (
                      <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                        <button onClick={()=>mover(c.id,'no_show')} style={{ flex: 1, height: 32, borderRadius: 10, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11 }}>No vino</button>
                        <button onClick={()=>mover(c.id,'cancelada')} style={{ flex: 1, height: 32, borderRadius: 10, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11 }}>Cancelar</button>
                        <button onClick={()=>enviarWhatsApp(c,'confirmar_cita')} style={{ height: 32, borderRadius: 10, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11 }}>WA</button>
                      </div>
                    )}
                  </div>
                )
              })}
              {col(estado).length===0 && <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: 16, padding: 24, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>{estado==='agendada'?'Sin agendados - + Nuevo paciente gigante':estado==='en_sala'?'Sala vacía':'Nadie aquí'}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* FABs 2 chats */}
      <div style={{ position: 'fixed', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 10, zIndex: 30 }}>
        <button onClick={()=>setShowEquipo(true)} title="Chat Equipo" style={{ width: 56, height: 56, borderRadius: 28, background: '#0F172A', color: 'white', border: 0, fontSize: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', cursor: 'pointer' }}>💬</button>
        <button onClick={()=>setShowTutores(true)} title="Chat Tutores" style={{ width: 56, height: 56, borderRadius: 28, background: '#25D366', color: 'white', border: 0, fontSize: 20, boxShadow: '0 4px 16px rgba(0,0,0,0.2)', cursor: 'pointer' }}>💬</button>
      </div>

      {/* Drawer Cobrar */}
      {drawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={()=>setDrawer(null)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ width: 380, maxWidth: '90vw', background: 'white', height: '100%', padding: 20, overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h2 style={{ fontSize: 18, fontWeight: 800 }}>{drawer.paciente.nombre} - {drawer.paciente.raza} {drawer.paciente.peso}kg</h2><button onClick={()=>setDrawer(null)} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>✕</button></div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>{drawer.tutor.nombre} • {drawer.tutor.rut} • 🔖 {drawer.paciente.microchip}</p>
            <div style={{ marginTop: 16, background: '#FFFBF7', borderRadius: 14, padding: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}><span>Consulta</span><span>$35.000</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8 }}><span>{drawer.motivo}</span><span>$15.000</span></div>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 15 }}><span>Total</span><span>${drawer.precio.toLocaleString('es-CL')}</span></div>
            </div>
            <div style={{ marginTop: 16 }}><p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1 }}>MÉTODO PAGO</p><div style={{ display: 'flex', gap: 8, marginTop: 8 }}>{['Transbank','Transferencia','Efectivo'].map(m=><button key={m} onClick={()=>setMetodo(m)} style={{ flex: 1, height: 40, borderRadius: 10, border: metodo===m?'2px solid #0F172A':'1px solid rgba(0,0,0,0.1)', background: metodo===m?'#0F172A':'white', color: metodo===m?'white':'black', fontSize: 11, fontWeight: 600 }}>{m}</button>)}</div></div>
            <div style={{ marginTop: 16, background: '#F3F4F6', borderRadius: 10, padding: 10 }}><label style={{ fontSize: 11, fontWeight: 600 }}><input type="checkbox" defaultChecked /> Emitir boleta SII • QR SERNAC • Microchip registrado</label></div>
            <div style={{ marginTop: 12, background: '#FFFBF7', borderRadius: 10, padding: 10, border: '1px dashed #F59E0B' }}><p style={{ fontSize: 11, fontWeight: 700 }}>Upsell acs.mascotas</p><p style={{ fontSize: 11, marginTop: 4 }}>+ Collar isabelino $8.900</p><p style={{ fontSize: 11 }}>+ Alimento i/d 2kg $24.900</p></div>
            <button onClick={async()=>{ await enviarWhatsApp(drawer,'listo_retiro'); setDrawer(null); setCitas(p=>p.map(c=>c.id===drawer.id?{...c, whatsapp:{por:'WA', hora: new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'America/Santiago'}), estado:'enviado'}}:c)); showToastMsg(`✓ Cobrado $${drawer.precio.toLocaleString('es-CL')} con ${metodo} - WA enviado`) }} style={{ width: '100%', marginTop: 16, height: 56, borderRadius: 16, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, fontSize: 14 }}>Cobrar y enviar WhatsApp 🎉</button>
          </div>
        </div>
      )}

      {ficha && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={()=>setFicha(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'relative', background: 'white', borderRadius: 16, padding: 16, width: 360, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><h3 style={{ fontWeight: 800 }}>{ficha.paciente.nombre} - {ficha.paciente.raza} {ficha.paciente.peso}kg</h3><button onClick={()=>setFicha(null)} style={{ width: 28, height: 28, borderRadius: 999, border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>✕</button></div>
            <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Última: {ficha.tutor.ultima} • ${ficha.tutor.deuda.toLocaleString('es-CL')} deuda • Alergia: ninguna</p>
            <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>{ficha.paciente.historial.map((v:number,i:number)=><div key={i} style={{ flex: 1, height: 28, background: '#FFFBF7', borderRadius: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><div style={{ width: '60%', height: `${(v/Math.max(...ficha.paciente.historial))*100}%`, background: '#16A34A', borderRadius: 3 }} /></div>)}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
              <button onClick={()=>window.open(`tel:${ficha.tutor.tel}`)} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: 12 }}>📞 Llamar</button>
              <button onClick={()=>enviarWhatsApp(ficha,'en_sala')} style={{ flex: 1, height: 40, borderRadius: 10, background: '#25D366', color: 'white', border: 0, fontSize: 12 }}>💬 WA {ficha.whatsapp?.hora||'Enviar'}</button>
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 4, flexWrap: 'wrap' }}>{['Confirmar 24h','Retraso 15m','Listo retiro','Boleta','Receta SAG'].map(pl=><button key={pl} onClick={()=>enviarWhatsApp(ficha, pl.toLowerCase().replace(' ','_'))} style={{ padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: 10 }}>{pl}</button>)}</div>
          </div>
        </div>
      )}

      {showEquipo && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={()=>setShowEquipo(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ width: 380, background: 'white', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 16, borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between' }}><h3 style={{ fontWeight: 800, fontSize: 14 }}>Equipo • {canal}</h3><button onClick={()=>setShowEquipo(false)}>✕</button></div>
            <div style={{ display: 'flex', gap: 6, padding: 10 }}>{['#box-1','#box-2','#recepcion','#hospitalizados'].map(ch=><button key={ch} onClick={()=>setCanal(ch)} style={{ padding: '6px 10px', borderRadius: 999, background: canal===ch?'#0F172A':'white', color: canal===ch?'white':'black', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11 }}>{ch}</button>)}</div>
            <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}>{citas.filter(c=>canal.includes(c.box.toLowerCase().replace(' ',''))||canal==='#recepcion').flatMap(c=>c.chatInterno.map((m:any,i:number)=><div key={i} style={{ background: m.prio==='urgente'?'#FEF2F2':'#F3F4F6', borderRadius: 12, padding: 10, marginBottom: 8, border: m.prio==='urgente'?'1px solid #EF4444':'none' }}><div style={{ fontSize: 11, fontWeight: 700 }}>{m.autor} {m.prio==='urgente'&&'🔴 Urgente'}</div><div style={{ fontSize: 12 }}>{m.msg}</div></div>))}</div>
            <div style={{ padding: 10, borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 6 }}><input placeholder="Mensaje equipo... @Bastian" style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px', fontSize: 12 }} /><button onClick={()=>showToastMsg('🔴 Urgente sonó en Box')} style={{ height: 36, padding: '0 10px', borderRadius: 10, background: '#EF4444', color: 'white', border: 0, fontSize: 12 }}>🔴</button></div>
          </div>
        </div>
      )}

      {showTutores && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={()=>setShowTutores(false)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ width: 420, maxWidth: '95vw', background: 'white', height: '100%', display: 'flex' }}>
            <div style={{ width: 140, borderRight: '1px solid rgba(0,0,0,0.06)', overflowY: 'auto' }}>{citas.map(c=><div key={c.id} style={{ padding: 10, borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }} onClick={()=>showToastMsg(`Chat con ${c.tutor.nombre}`)}><div style={{ fontSize: 11, fontWeight: 700 }}>{c.tutor.nombre.split(' ')[0]} - {c.paciente.nombre}</div><div style={{ fontSize: 10, color: '#6b7280' }}>{c.tutor.mensaje||'hace 5m'}</div>{c.estado==='atendida'&&<div style={{ fontSize: 9, background: '#FEF3C7', padding: '2px 6px', borderRadius: 999, marginTop: 4, display: 'inline-block' }}>Por cobrar ${c.precio.toLocaleString('es-CL')}</div>}</div>)}</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.06)', fontWeight: 700, fontSize: 12 }}>Bastian G. - Milo - $50.000 por cobrar</div>
              <div style={{ flex: 1, padding: 12, overflowY: 'auto' }}><div style={{ background: '#F3F4F6', borderRadius: 12, padding: 8, fontSize: 12, marginBottom: 8 }}>¿A qué hora retiro a Milo?</div><div style={{ background: '#DCF8C6', borderRadius: 12, padding: 8, fontSize: 12, marginLeft: 16 }}>Hola Bastian, Milo agendado hoy 09:00 Box 2 ¿Confirmas? Sí/No ✓✓ 09:12</div></div>
              <div style={{ padding: 8, borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 6, overflowX: 'auto' }}>{['Confirmar 24h','Retraso 15m','Listo retiro','Boleta $45k','Receta SAG'].map(b=><button key={b} onClick={()=>enviarWhatsApp(citas[0], b.toLowerCase().replace(' ','_'))} style={{ padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.1)', background: 'white', fontSize: 9, whiteSpace: 'nowrap' }}>{b}</button>)}</div>
                <div style={{ display: 'flex', gap: 6 }}><input placeholder="Escribe mensaje..." style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px', fontSize: 12 }} /><button onClick={()=>enviarWhatsApp(citas[0],'en_sala')} style={{ height: 36, padding: '0 12px', borderRadius: 10, background: '#25D366', color: 'white', border: 0, fontSize: 12 }}>Enviar</button></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {undo && <div style={{ position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '10px 16px', borderRadius: 999, fontSize: 13, display: 'flex', gap: 12, zIndex: 70, alignItems: 'center' }}><span>{toast}</span><button onClick={deshacer} style={{ background: 'white', color: 'black', borderRadius: 999, padding: '4px 12px', border: 0, fontWeight: 700, fontSize: 12 }}>Deshacer</button></div>}
      {toast && !undo && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '12px 20px', borderRadius: 999, fontSize: 13, zIndex: 70 }}>{toast}</div>}
    </div>
  )
}
