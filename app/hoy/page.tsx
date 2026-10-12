'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Estado = 'agendada' | 'en_sala' | 'en_consulta' | 'atendida' | 'no_show' | 'cancelada'

type Cita = {
  id: string
  fecha_hora: string
  updated_at: string
  estado: Estado
  motivo: string
  box: string
  precio: number
  whatsapp_estado: 'confirmado' | 'pendiente'
  whatsapp_hora?: string
  pacientes: { nombre: string, especie: string, raza: string, peso_kg: number, microchip: string, foto?: string, peso_historial: number[] }
  tutores: { nombre_completo: string, rut: string, telefono_whatsapp: string, deuda: number, ultima_visita: string }
}

const MOCK: Cita[] = [
  { id: 'm1', fecha_hora: new Date(new Date().setHours(9,0,0,0)).toISOString(), updated_at: new Date(Date.now()-12*60000).toISOString(), estado: 'agendada', motivo: 'Vacuna antirrábica', box: 'Box 2', precio: 35000, whatsapp_estado: 'confirmado', whatsapp_hora: '09:12', pacientes: { nombre: 'Milo', especie: 'canino', raza: 'Beagle', peso_kg: 22, microchip: '900000000000001', peso_historial: [20,21,22] }, tutores: { nombre_completo: 'Bastian Gajardo', rut: '11.111.111-1', telefono_whatsapp: '+56912345678', deuda: 0, ultima_visita: '12 sep' } },
  { id: 'm2', fecha_hora: new Date(new Date().setHours(10,30,0,0)).toISOString(), updated_at: new Date(Date.now()-14*60000).toISOString(), estado: 'en_sala', motivo: 'Vómito 24h', box: 'Box 1', precio: 45000, whatsapp_estado: 'pendiente', pacientes: { nombre: 'Luna', especie: 'felino', raza: 'Siamés', peso_kg: 4.5, microchip: '900000000000002', peso_historial: [4.2,4.3,4.5] }, tutores: { nombre_completo: 'Maria Perez', rut: '22.222.222-2', telefono_whatsapp: '+56987654321', deuda: 30000, ultima_visita: '02 oct' } },
  { id: 'm3', fecha_hora: new Date(new Date().setHours(11,0,0,0)).toISOString(), updated_at: new Date(Date.now()-8*60000).toISOString(), estado: 'en_consulta', motivo: 'Control post cirugía', box: 'Box 2', precio: 50000, whatsapp_estado: 'confirmado', whatsapp_hora: '10:45', pacientes: { nombre: 'Thor', especie: 'canino', raza: 'Labrador', peso_kg: 30, microchip: '900000000000003', peso_historial: [28,29,30] }, tutores: { nombre_completo: 'Juan Soto', rut: '33.333.333-3', telefono_whatsapp: '+56911112222', deuda: 0, ultima_visita: '11 oct' } },
  { id: 'm4', fecha_hora: new Date(new Date().setHours(14,0,0,0)).toISOString(), updated_at: new Date().toISOString(), estado: 'atendida', motivo: 'Desparasitación', box: 'Box 1', precio: 45000, whatsapp_estado: 'confirmado', whatsapp_hora: '13:20', pacientes: { nombre: 'Coco', especie: 'canino', raza: 'Poodle', peso_kg: 8, microchip: '900000000000004', peso_historial: [7.5,7.8,8] }, tutores: { nombre_completo: 'Ana Lopez', rut: '44.444.444-4', telefono_whatsapp: '+56933334444', deuda: 0, ultima_visita: '10 oct' } },
]

export default function HoyFinalVende() {
  const [citas, setCitas] = useState<Cita[]>(MOCK)
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())
  const [dragId, setDragId] = useState<string | null>(null)
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)
  const [drawerCita, setDrawerCita] = useState<Cita | null>(null)
  const [fichaCita, setFichaCita] = useState<Cita | null>(null)
  const [metodo, setMetodo] = useState('Transbank')

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(i)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('agenda').select('id, fecha_hora, updated_at, estado, motivo, box, precio, pacientes(nombre, especie, raza, peso_kg, microchip), tutores(nombre_completo, rut, telefono_whatsapp)').gte('fecha_hora', new Date(new Date().setHours(0,0,0,0)).toISOString()).order('fecha_hora', { ascending: true })
        if (data && data.length > 0) {
          const mapped = data.map((d: any) => ({
            ...d,
            whatsapp_estado: Math.random() > 0.5 ? 'confirmado' : 'pendiente',
            whatsapp_hora: '09:12',
            pacientes: { ...d.pacientes, raza: d.pacientes.raza || 'Mestizo', peso_kg: d.pacientes.peso_kg || 20, microchip: d.pacientes.microchip || '900000000000000', peso_historial: [18,19,20] },
            tutores: { ...d.tutores, deuda: 0, ultima_visita: '12 sep' }
          }))
          setCitas(mapped as any)
        }
      } catch {}
    })()
  }, [])

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 3000) }

  const mover = (id: string, nuevo: Estado) => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevo, updated_at: new Date().toISOString() } : c))
    showToast(nuevo === 'en_sala' ? '✓ Check-in → EN SALA' : nuevo === 'en_consulta' ? '→ En BOX 2' : nuevo === 'atendida' ? '✓ Alta dada' : nuevo === 'no_show' ? 'Marcado como No vino' : 'Cancelada')
    supabase.from('agenda').update({ estado: nuevo }).eq('id', id).then(()=>{})
  }

  const onDragStart = (id: string) => setDragId(id)
  const onDragOver = (e: any, col: string) => { e.preventDefault(); setDragOverCol(col) }
  const onDrop = (e: any, col: string) => {
    e.preventDefault()
    if (dragId) {
      mover(dragId, col as Estado)
    }
    setDragId(null)
    setDragOverCol(null)
  }

  const filtradas = useMemo(() => {
    if (!q) return citas
    const s = q.toLowerCase().replace(/[^a-z0-9]/g, '')
    return citas.filter(c => {
      const nombre = c.pacientes.nombre.toLowerCase()
      const rut = c.tutores.rut.toLowerCase().replace(/[^a-z0-9]/g, '')
      const micro = (c.pacientes.microchip || '').toLowerCase()
      return nombre.includes(q.toLowerCase()) || rut.includes(s) || micro.includes(s)
    })
  }, [citas, q])

  const col = (e: Estado) => filtradas.filter(c => c.estado === e)
  const agendadas = col('agendada')
  const enSala = col('en_sala')
  const enConsulta = col('en_consulta')
  const atendidas = col('atendida')
  const noShows = col('no_show')

  const stats = {
    hoy: filtradas.length,
    porCobrar: atendidas.reduce((a, b) => a + (b.precio || 0), 0),
    noShows: noShows.length,
  }

  const formatHora = (iso: string) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'America/Santiago' })
  
  const tiempoEnEstado = (updated: string) => {
    const diff = Math.floor((now.getTime() - new Date(updated).getTime()) / 60000)
    if (diff < 1) return { txt: 'ahora', color: '#6b7280', bg: 'transparent' }
    if (diff >= 25) return { txt: `+${diff}m en sala`, color: '#EF4444', bg: '#FEF2F2', pulse: true }
    if (diff >= 15) return { txt: `+${diff}m en sala`, color: '#D97706', bg: '#FFFBEB', pulse: false }
    return { txt: `+${diff}m en sala`, color: '#6b7280', bg: 'transparent', pulse: false }
  }

  const retraso = (fecha_hora: string) => {
    const diff = Math.floor((now.getTime() - new Date(fecha_hora).getTime()) / 60000)
    if (diff > 30) {
      const h = Math.floor(diff/60)
      const m = diff%60
      return h > 0 ? `+${h}h${m}m retraso` : `+${m}m retraso`
    }
    return null
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, system-ui' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,251,247,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>VetSimple</h1>
            <div style={{ display: 'flex', background: 'white', borderRadius: 999, padding: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ padding: '7px 18px', borderRadius: 999, background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 700 }}>/HOY</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 10, padding: '8px 14px', background: 'white', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', fontSize: 12, fontWeight: 700 }}>
              <span>{stats.hoy} hoy</span><span style={{ color: '#e5e7eb' }}>|</span><span>${stats.porCobrar.toLocaleString('es-CL')} por cobrar</span><span style={{ color: '#e5e7eb' }}>|</span><span style={{ color: stats.noShows ? '#EF4444' : '#16A34A' }}>{stats.noShows} no-shows</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca Milo, RUT 11.111.111-1, microchip 900000000000001..." style={{ width: '100%', height: 60, borderRadius: 24, background: 'white', border: '1px solid rgba(0,0,0,0.1)', padding: '0 20px 0 48px', fontSize: 15, outline: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} />
          <span style={{ position: 'absolute', left: 18, top: 19, color: '#9ca3af' }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
        <div onDragOver={(e) => onDragOver(e, 'agendada')} onDrop={(e) => onDrop(e, 'agendada')} style={{ background: dragOverCol === 'agendada' ? '#EEF2FF' : 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12, border: dragOverCol === 'agendada' ? '2px dashed #6366F1' : '1px solid transparent', transition: 'all 0.2s' }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>AGENDADOS · {agendadas.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {agendadas.map(c => {
              const t = tiempoEnEstado(c.updated_at)
              const ret = retraso(c.fecha_hora)
              return (
                <div key={c.id} draggable onDragStart={() => onDragStart(c.id)} style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', cursor: 'grab', opacity: dragId === c.id ? 0.5 : 1 }}>
                  <div onClick={() => setFichaCita(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{c.pacientes.especie === 'canino' ? '🐶' : '🐱'}</div>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{c.pacientes.nombre} - {c.pacientes.raza} {c.pacientes.peso_kg}kg</h4>
                        <p style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>{c.tutores.nombre_completo} • {c.tutores.rut}</p>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>{c.motivo} • {formatHora(c.fecha_hora)} • {c.box} • <span style={{ color: t.color, background: t.bg, padding: t.bg !== 'transparent' ? '2px 6px' : 0, borderRadius: 6, fontWeight: t.color === '#EF4444' ? 700 : 400, animation: (t as any).pulse ? 'pulse 1s infinite' : 'none' }}>{t.txt}</span></p>
                        {ret && <p style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>{ret}</p>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => mover(c.id, 'en_sala')} style={{ width: '100%', marginTop: 12, height: 60, borderRadius: 24, background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer' }}>Check-in →</button>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button onClick={() => mover(c.id, 'no_show')} style={{ flex: 1, height: 36, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, cursor: 'pointer' }}>No vino</button>
                    <button onClick={() => mover(c.id, 'cancelada')} style={{ flex: 1, height: 36, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, cursor: 'pointer' }}>Cancelar</button>
                  </div>
                </div>
              )
            })}
            {agendadas.length === 0 && (
              <div onClick={() => showToast('Nuevo paciente')} style={{ background: 'white', border: '2px dashed rgba(0,0,0,0.12)', borderRadius: 20, padding: 32, textAlign: 'center', cursor: 'pointer' }}>
                <div style={{ fontSize: 32 }}>🐾</div>
                <p style={{ fontWeight: 700, marginTop: 8 }}>Sin agendados</p>
                <div style={{ marginTop: 16, height: 60, borderRadius: 24, background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>+ Nuevo paciente gigante</div>
              </div>
            )}
          </div>
        </div>

        <div onDragOver={(e) => onDragOver(e, 'en_sala')} onDrop={(e) => onDrop(e, 'en_sala')} style={{ background: dragOverCol === 'en_sala' ? '#ECFDF5' : 'white', borderRadius: 20, padding: 12, border: dragOverCol === 'en_sala' ? '2px dashed #16A34A' : '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>EN SALA · {enSala.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {enSala.map(c => {
              const t = tiempoEnEstado(c.updated_at)
              const ret = retraso(c.fecha_hora)
              return (
                <div key={c.id} draggable onDragStart={() => onDragStart(c.id)} style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.04)', cursor: 'grab', opacity: dragId === c.id ? 0.5 : 1 }}>
                  <div onClick={() => setFichaCita(c)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{c.pacientes.especie === 'canino' ? '🐶' : '🐱'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: 18, fontWeight: 800 }}>{c.pacientes.nombre} - {c.pacientes.raza} {c.pacientes.peso_kg}kg</h4>
                          <span onClick={(e) => { e.stopPropagation(); showToast('Ir a /vacunas - Aplicar ahora'); }} style={{ fontSize: 10, fontWeight: 800, background: '#FEF2F2', color: '#EF4444', padding: '4px 8px', borderRadius: 999, cursor: 'pointer' }}>● Antirrábica vencida</span>
                        </div>
                        <p style={{ fontSize: 12, color: '#6b7280' }}>{c.motivo} • {formatHora(c.fecha_hora)} • {c.box} • <span style={{ color: t.color, background: t.bg, padding: t.bg !== 'transparent' ? '2px 6px' : 0, borderRadius: 6, fontWeight: t.color === '#EF4444' ? 700 : 400, animation: (t as any).pulse ? 'pulse 1s infinite' : 'none' }}>{t.txt}</span></p>
                        {ret && <p style={{ fontSize: 11, color: '#EF4444', fontWeight: 700 }}>{ret}</p>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => mover(c.id, 'en_consulta')} style={{ width: '100%', marginTop: 12, height: 60, borderRadius: 24, background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>Pasar a BOX →</button>
                </div>
              )
            })}
            {enSala.length === 0 && <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: 20, padding: 28, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>Sala vacía</div>}
          </div>
        </div>

        <div onDragOver={(e) => onDragOver(e, 'en_consulta')} onDrop={(e) => onDrop(e, 'en_consulta')} style={{ background: dragOverCol === 'en_consulta' ? '#EEF2FF' : 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>EN CONSULTA · {enConsulta.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {enConsulta.map(c => (
              <div key={c.id} draggable onDragStart={() => onDragStart(c.id)} style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.04)', cursor: 'grab', opacity: dragId === c.id ? 0.5 : 1 }}>
                <div onClick={() => setFichaCita(c)} style={{ cursor: 'pointer' }}><div style={{ fontSize: 18, fontWeight: 800 }}>{c.pacientes.nombre} - {c.pacientes.raza} {c.pacientes.peso_kg}kg</div><div style={{ fontSize: 12, color: '#6b7280' }}>{formatHora(c.fecha_hora)} • {c.box}</div></div>
                <button onClick={() => mover(c.id, 'atendida')} style={{ width: '100%', marginTop: 12, height: 60, borderRadius: 24, background: '#0F172A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer' }}>Dar alta ✓</button>
              </div>
            ))}
          </div>
        </div>

        <div onDragOver={(e) => onDragOver(e, 'atendida')} onDrop={(e) => onDrop(e, 'atendida')} style={{ background: dragOverCol === 'atendida' ? '#FEF3C7' : 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>LISTOS · {atendidas.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {atendidas.map(c => (
              <div key={c.id} draggable onDragStart={() => onDragStart(c.id)} style={{ background: 'white', borderRadius: 20, padding: 16, opacity: 0.9, border: '1px solid rgba(0,0,0,0.04)', cursor: 'grab' }}>
                <div style={{ fontSize: 18, fontWeight: 800 }}>{c.pacientes.nombre}</div><div style={{ fontSize: 12, color: '#6b7280' }}>{c.tutores.nombre_completo} • ${c.precio.toLocaleString('es-CL')}</div>
                <button onClick={() => setDrawerCita(c)} style={{ width: '100%', marginTop: 12, height: 60, borderRadius: 24, background: '#0F172A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer' }}>Cobrar ${c.precio.toLocaleString('es-CL')}</button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {drawerCita && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => setDrawerCita(null)} style={{ flex: 1, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ width: 380, maxWidth: '90vw', background: 'white', height: '100%', padding: 20, overflowY: 'auto', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: 20, fontWeight: 800 }}>{drawerCita.pacientes.nombre} - {drawerCita.pacientes.raza}</h2>
              <button onClick={() => setDrawerCita(null)} style={{ width: 32, height: 32, borderRadius: 999, border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>{drawerCita.tutores.nombre_completo} • {drawerCita.tutores.rut}</p>
            <div style={{ marginTop: 20, background: '#FFFBF7', borderRadius: 16, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>Consulta</span><span>$35.000</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginTop: 8 }}><span>{drawerCita.motivo}</span><span>$15.000</span></div>
              <div style={{ borderTop: '1px solid rgba(0,0,0,0.1)', marginTop: 12, paddingTop: 12, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}><span>Total</span><span>${drawerCita.precio.toLocaleString('es-CL')}</span></div>
            </div>
            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>MÉTODO PAGO</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                {['Transbank','Transferencia','Efectivo'].map(m => (
                  <button key={m} onClick={() => setMetodo(m)} style={{ flex: 1, height: 44, borderRadius: 12, border: metodo === m ? '2px solid #0F172A' : '1px solid rgba(0,0,0,0.1)', background: metodo === m ? '#0F172A' : 'white', color: metodo === m ? 'white' : '#0F172A', fontSize: 12, fontWeight: 600 }}>{m}</button>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 20, background: '#F3F4F6', borderRadius: 12, padding: 12 }}>
              <label style={{ fontSize: 12, fontWeight: 600 }}><input type="checkbox" defaultChecked /> Emitir boleta SII • RUT {drawerCita.tutores.rut}</label>
              <p style={{ fontSize: 11, color: '#6b7280', marginTop: 8 }}>QR SERNAC incluido • Microchip {drawerCita.pacientes.microchip} registrado</p>
            </div>
            <div style={{ marginTop: 20, background: '#FFFBF7', borderRadius: 12, padding: 12, border: '1px dashed #F59E0B' }}>
              <p style={{ fontSize: 12, fontWeight: 700 }}>Upsell acs.mascotas (comisión clínica)</p>
              <p style={{ fontSize: 12, marginTop: 6 }}>+ Collar isabelino $8.900</p>
              <p style={{ fontSize: 12 }}>+ Alimento i/d 2kg $24.900</p>
            </div>
            <button onClick={() => { showToast(`✓ Cobrado $${drawerCita.precio.toLocaleString('es-CL')} con ${metodo} + WhatsApp enviado`); setDrawerCita(null); mover(drawerCita.id, 'atendida') }} style={{ width: '100%', marginTop: 20, height: 60, borderRadius: 24, background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer' }}>Cobrar y enviar WhatsApp 🎉</button>
            <p style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 12 }}>Hola {drawerCita.tutores.nombre_completo.split(' ')[0]}, {drawerCita.pacientes.nombre} está listo para retiro</p>
          </div>
        </div>
      )}

      {fichaCita && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div onClick={() => setFichaCita(null)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)' }} />
          <div style={{ position: 'relative', background: 'white', borderRadius: 20, padding: 20, maxWidth: 360, width: '100%', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: 18, fontWeight: 800 }}>{fichaCita.pacientes.nombre}</h3>
              <button onClick={() => setFichaCita(null)} style={{ width: 28, height: 28, borderRadius: 999, border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>✕</button>
            </div>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>Última: {fichaCita.tutores.ultima_visita} • ${fichaCita.tutores.deuda.toLocaleString('es-CL')} deuda</p>
            <p style={{ fontSize: 12, marginTop: 8 }}>Raza: {fichaCita.pacientes.raza} {fichaCita.pacientes.peso_kg}kg</p>
            <p style={{ fontSize: 12 }}>Microchip: {fichaCita.pacientes.microchip}</p>
            <div style={{ marginTop: 12, display: 'flex', gap: 4 }}>
              {fichaCita.pacientes.peso_historial.map((v, i) => <div key={i} style={{ flex: 1, height: 24, background: '#FFFBF7', borderRadius: 4, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}><div style={{ width: '60%', height: `${(v / Math.max(...fichaCita.pacientes.peso_historial))*100}%`, background: '#16A34A', borderRadius: 2 }} /></div>)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={() => window.open(`tel:${fichaCita.tutores.telefono_whatsapp}`)} style={{ flex: 1, height: 40, borderRadius: 12, border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>📞 Llamar</button>
              <button onClick={() => window.open(`https://wa.me/${fichaCita.tutores.telefono_whatsapp.replace(/[^0-9]/g,'')}`)} style={{ flex: 1, height: 40, borderRadius: 12, background: '#16A34A', color: 'white', border: 0 }}>💬 WA {fichaCita.whatsapp_estado === 'confirmado' ? `✓ ${fichaCita.whatsapp_hora}` : 'Re-enviar'}</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, zIndex: 60 }}>{toast}</div>}
    </div>
  )
}
