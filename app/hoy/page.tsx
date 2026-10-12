'use client'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cita = {
  id: string
  fecha_hora: string
  updated_at?: string
  estado: 'agendada' | 'en_sala' | 'en_consulta' | 'atendida' | 'no_show' | 'cancelada'
  motivo: string
  box: string
  precio: number
  pacientes: { nombre: string, especie: string, raza: string, peso_kg: number, microchip: string }
  tutores: { nombre_completo: string, rut: string, telefono_whatsapp: string }
}

const MOCK: Cita[] = [
  { id: 'm1', fecha_hora: new Date(new Date().setHours(9,0,0,0)).toISOString(), updated_at: new Date(Date.now()-12*60000).toISOString(), estado: 'agendada', motivo: 'Vacuna antirrábica', box: 'Box 2', precio: 35000, pacientes: { nombre: 'Milo', especie: 'canino', raza: 'Beagle', peso_kg: 22, microchip: '900000000000001' }, tutores: { nombre_completo: 'Bastian Gajardo', rut: '11.111.111-1', telefono_whatsapp: '+56912345678' } },
  { id: 'm2', fecha_hora: new Date(new Date().setHours(10,30,0,0)).toISOString(), updated_at: new Date(Date.now()-12*60000).toISOString(), estado: 'en_sala', motivo: 'Vómito 24h', box: 'Box 1', precio: 45000, pacientes: { nombre: 'Luna', especie: 'felino', raza: 'Siamés', peso_kg: 4.5, microchip: '900000000000002' }, tutores: { nombre_completo: 'Maria Perez', rut: '22.222.222-2', telefono_whatsapp: '+56987654321' } },
  { id: 'm3', fecha_hora: new Date(new Date().setHours(11,0,0,0)).toISOString(), updated_at: new Date(Date.now()-8*60000).toISOString(), estado: 'en_consulta', motivo: 'Control post cirugía', box: 'Box 2', precio: 50000, pacientes: { nombre: 'Thor', especie: 'canino', raza: 'Labrador', peso_kg: 30, microchip: '900000000000003' }, tutores: { nombre_completo: 'Juan Soto', rut: '33.333.333-3', telefono_whatsapp: '+56911112222' } },
  { id: 'm4', fecha_hora: new Date(new Date().setHours(14,0,0,0)).toISOString(), updated_at: new Date().toISOString(), estado: 'atendida', motivo: 'Desparasitación', box: 'Box 1', precio: 45000, pacientes: { nombre: 'Coco', especie: 'canino', raza: 'Poodle', peso_kg: 8, microchip: '900000000000004' }, tutores: { nombre_completo: 'Ana Lopez', rut: '44.444.444-4', telefono_whatsapp: '+56933334444' } },
]

export default function HoyP0() {
  const [citas, setCitas] = useState<Cita[]>(MOCK)
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('agenda').select('id, fecha_hora, updated_at, estado, motivo, box, precio, pacientes(nombre, especie, raza, peso_kg, microchip), tutores(nombre_completo, rut, telefono_whatsapp)').gte('fecha_hora', new Date(new Date().setHours(0,0,0,0)).toISOString()).order('fecha_hora', { ascending: true })
        if (data && data.length > 0) setCitas(data as any)
      } catch {}
    })()
    const ch = supabase.channel('agenda-changes').on('postgres_changes', { event: '*', schema: 'public', table: 'agenda' }, (payload) => {
      if (payload.eventType === 'UPDATE') {
        setCitas(prev => prev.map(c => c.id === payload.new.id ? { ...c, ...payload.new, pacientes: c.pacientes, tutores: c.tutores } as any : c))
      }
    }).subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [])

  const showToast = (m: string) => { setToast(m); setTimeout(() => setToast(''), 2500) }

  const mover = (id: string, nuevo: Cita['estado']) => {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevo, updated_at: new Date().toISOString() } : c))
    showToast(nuevo === 'en_sala' ? '✓ Check-in → EN SALA' : nuevo === 'en_consulta' ? '→ En BOX 2' : nuevo === 'atendida' ? '✓ Alta dada' : 'Movido a ' + nuevo)
    supabase.from('agenda').update({ estado: nuevo }).eq('id', id).then(()=>{})
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

  const col = (e: string) => filtradas.filter(c => c.estado === e)
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

  const formatHora = (iso: string) => new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Santiago' })
  const tiempoEnEstado = (updated?: string) => {
    if (!updated) return ''
    const diff = Math.floor((now.getTime() - new Date(updated).getTime()) / 60000)
    if (diff < 1) return 'ahora'
    return `+${diff}m`
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, system-ui' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');`}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,251,247,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>VetSimple</h1>
            <div style={{ display: 'flex', background: 'white', borderRadius: 999, padding: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ padding: '7px 18px', borderRadius: 999, background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 700 }}>/HOY</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
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
        <Col title={`AGENDADOS · ${agendadas.length}`} count={agendadas.length} empty={agendadas.length === 0 && <EmptyGigante onClick={() => showToast('Abre /pacientes/nuevo')} />}>
          {agendadas.map(c => (
            <Card key={c.id} cita={c} formatHora={formatHora} tiempo={tiempoEnEstado(c.updated_at)} onAlerta={() => showToast('⚠️ Antirrábica vencida hace 23 días - Vacunar')} onMove={() => mover(c.id, 'en_sala')} label="Check-in →" color="#16A34A" />
          ))}
        </Col>
        <Col title={`EN SALA · ${enSala.length}`} count={enSala.length} highlight>
          {enSala.map(c => (
            <Card key={c.id} cita={c} formatHora={formatHora} tiempo={tiempoEnEstado(c.updated_at)} onAlerta={() => showToast('⚠️ Antirrábica vencida')} onMove={() => mover(c.id, 'en_consulta')} label="Pasar a BOX →" color="#16A34A" />
          ))}
          {enSala.length === 0 && <Empty label="Sala vacía" />}
        </Col>
        <Col title={`EN CONSULTA · ${enConsulta.length}`} count={enConsulta.length}>
          {enConsulta.map(c => (
            <Card key={c.id} cita={c} formatHora={formatHora} tiempo={tiempoEnEstado(c.updated_at)} onMove={() => mover(c.id, 'atendida')} label="Dar alta ✓" color="#0F172A" />
          ))}
          {enConsulta.length === 0 && <Empty label="Nadie en consulta" />}
        </Col>
        <Col title={`LISTOS · ${atendidas.length}`} count={atendidas.length}>
          {atendidas.map(c => (
            <Card key={c.id} cita={c} formatHora={formatHora} tiempo={tiempoEnEstado(c.updated_at)} onMove={() => { window.location.href = '/caja' }} label={`Cobrar $${c.precio.toLocaleString('es-CL')}`} color="#0F172A" />
          ))}
          {atendidas.length === 0 && <Empty label="Nada por cobrar" />}
        </Col>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '0 20px 40px', textAlign: 'center', fontSize: 11, color: '#9ca3af' }}>
        QR SERNAC • Microchip 900 registrado • Chile • America/Santiago
      </div>

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, zIndex: 50, boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }}>{toast}</div>}
    </div>
  )
}

function Col({ title, count, children, highlight, empty }: any) {
  return (
    <div style={{ background: highlight ? 'white' : 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12, border: highlight ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent', boxShadow: highlight ? '0 1px 4px rgba(0,0,0,0.04)' : 'none' }}>
      <div style={{ padding: '8px 12px', display: 'flex', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)' }}>{title}</h3>
        <div style={{ width: 8, height: 8, borderRadius: 999, background: count > 0 ? '#16A34A' : 'rgba(0,0,0,0.12)' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
        {empty ? empty : children}
      </div>
    </div>
  )
}

function Card({ cita, formatHora, tiempo, onMove, label, color, onAlerta }: any) {
  const emoji = cita.pacientes.especie === 'canino' ? '🐶' : cita.pacientes.especie === 'felino' ? '🐱' : '🐾'
  const atrasado = () => {
    const ahora = new Date()
    const citaHora = new Date(cita.fecha_hora)
    const diff = Math.floor((ahora.getTime() - citaHora.getTime()) / 60000)
    if (diff > 30) return `+${Math.floor(diff/60)}h${diff%60}m retraso`
    return null
  }
  const ret = atrasado()

  return (
    <div style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer' }} onClick={() => { if (cita.id.startsWith('m')) return; window.location.href = `/paciente/${cita.pacientes.nombre}` }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: '#FFFBF7', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{emoji}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
            <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A', lineHeight: 1.1 }}>{cita.pacientes.nombre} - {cita.pacientes.raza} {cita.pacientes.peso_kg}kg</h4>
            {cita.estado !== 'atendida' && (
              <span onClick={(e) => { e.stopPropagation(); onAlerta && onAlerta() }} style={{ fontSize: 10, fontWeight: 800, background: '#FEF2F2', color: '#EF4444', padding: '4px 8px', borderRadius: 999, border: '1px solid rgba(239,68,68,0.12)', cursor: 'pointer' }}>● Antirrábica vencida</span>
            )}
          </div>
          <p style={{ fontSize: 13, color: '#374151', marginTop: 4, fontWeight: 600 }}>{cita.tutores.nombre_completo} • {cita.tutores.rut}</p>
          <p style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{cita.motivo} • {formatHora(cita.fecha_hora)} • {cita.box} {tiempo && <span style={{ color: '#6b7280' }}>• {tiempo} en {cita.estado.replace('_',' ')}</span>}</p>
          {ret && <p style={{ fontSize: 11, color: '#EF4444', fontWeight: 700, marginTop: 2 }}>{ret}</p>}
          <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>🔖 {cita.pacientes.microchip}</p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={(e) => { e.stopPropagation(); window.open(`tel:${cita.tutores.telefono_whatsapp}`) }} style={{ height: 36, padding: '0 12px', borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, cursor: 'pointer' }}>📞 Llamar</button>
        <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${cita.tutores.telefono_whatsapp.replace(/[^0-9]/g,'')}`) }} style={{ height: 36, padding: '0 12px', borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, cursor: 'pointer' }}>💬 WhatsApp</button>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onMove() }} style={{ width: '100%', marginTop: 12, height: 60, borderRadius: 24, background: color, color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer', boxShadow: color === '#16A34A' ? '0 4px 12px rgba(22,163,74,0.25)' : 'none' }}>{label}</button>
    </div>
  )
}

function Empty({ label }: any) { return <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: 20, padding: 28, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>{label}</div> }
function EmptyGigante({ onClick }: any) {
  return (
    <div onClick={onClick} style={{ background: 'white', border: '2px dashed rgba(0,0,0,0.12)', borderRadius: 20, padding: 32, textAlign: 'center', cursor: 'pointer' }}>
      <div style={{ fontSize: 32 }}>🐾</div>
      <p style={{ fontSize: 14, fontWeight: 700, marginTop: 8 }}>Sin agendados</p>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Toca para crear</p>
      <div style={{ marginTop: 16, height: 60, borderRadius: 24, background: '#0F172A', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14 }}>+ Nuevo paciente gigante</div>
    </div>
  )
}
