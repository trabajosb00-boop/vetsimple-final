'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function HoyPage() {
  const [citas, setCitas] = useState<any[]>([
    { id: '1', fecha_hora: new Date().toISOString(), estado: 'agendada', motivo: 'Vacuna antirrabica', pacientes: { nombre: 'Milo', especie: 'canino' }, tutores: { nombre_completo: 'Bastian Gajardo' } },
    { id: '2', fecha_hora: new Date().toISOString(), estado: 'en_sala', motivo: 'Vomito 24h', pacientes: { nombre: 'Luna', especie: 'felino' }, tutores: { nombre_completo: 'Maria Perez' } },
    { id: '3', fecha_hora: new Date().toISOString(), estado: 'en_consulta', motivo: 'Control post cirugia', pacientes: { nombre: 'Thor', especie: 'canino' }, tutores: { nombre_completo: 'Juan Soto' } },
    { id: '4', fecha_hora: new Date().toISOString(), estado: 'atendida', motivo: 'Desparasitacion', pacientes: { nombre: 'Coco', especie: 'canino' }, tutores: { nombre_completo: 'Ana Lopez' } },
  ])
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const { data } = await supabase.from('agenda').select('id, fecha_hora, estado, motivo, pacientes(nombre, especie), tutores(nombre_completo)').gte('fecha_hora', hoy.toISOString()).order('fecha_hora', { ascending: true }).limit(80)
        if (data && data.length > 0) setCitas(data)
      } catch {}
    }
    load()
  }, [])

  function mover(id: string, nuevo: string) {
    setCitas((prev) => prev.map((c) => (c.id === id ? { ...c, estado: nuevo } : c)))
    setToast(nuevo === 'en_sala' ? '✓ Check-in hecho' : nuevo === 'en_consulta' ? '→ En BOX' : '✓ Alta dada')
    setTimeout(() => setToast(''), 2000)
    supabase.from('agenda').update({ estado: nuevo }).eq('id', id).then(() => {})
  }

  const filtradas = citas.filter((c) => {
    if (!q) return true
    const s = q.toLowerCase()
    return c.pacientes?.nombre?.toLowerCase().includes(s) || c.tutores?.nombre_completo?.toLowerCase().includes(s)
  })

  const porEstado = (e: string) => filtradas.filter((c) => c.estado === e)
  const agendadas = [...porEstado('agendada'), ...porEstado('confirmada_whatsapp')]
  const enSala = porEstado('en_sala')
  const enConsulta = porEstado('en_consulta')
  const atendidas = porEstado('atendida')

  const emoji = (especie: string) => {
    if (especie === 'canino') return '🐶'
    if (especie === 'felino') return '🐱'
    return '🐾'
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');`}</style>

      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(255,251,247,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>VetSimple</h1>
            <div style={{ display: 'flex', background: 'white', borderRadius: 999, padding: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ padding: '7px 18px', borderRadius: 999, background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 700 }}>/HOY</span>
            </div>
          </div>
          <div style={{ padding: '8px 14px', background: 'white', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', fontSize: 12, fontWeight: 600 }}>
            {citas.length} hoy | $540.000 | <span style={{ color: '#16A34A' }}>0 no-shows</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." style={{ width: '100%', height: 60, borderRadius: 24, background: 'white', border: '1px solid rgba(0,0,0,0.1)', padding: '0 20px 0 48px', fontSize: 16, outline: 'none', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }} />
          <span style={{ position: 'absolute', left: 18, top: 19, color: '#9ca3af' }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div style={{ background: 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>AGENDADOS · {agendadas.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {agendadas.map((c) => (
              <div key={c.id} style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji(c.pacientes?.especie)}</div>
                  <div><div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{c.pacientes?.nombre}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo} • {c.motivo}</div></div>
                </div>
                <button onClick={() => mover(c.id, 'en_sala')} style={{ width: '100%', marginTop: 16, height: 60, borderRadius: 24, background: '#0F172A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer' }}>Check-in → Sala</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'white', borderRadius: 20, padding: 12, border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>EN SALA · {enSala.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {enSala.map((c) => (
              <div key={c.id} style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji(c.pacientes?.especie)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><div style={{ fontSize: 18, fontWeight: 800 }}>{c.pacientes?.nombre}</div><span style={{ fontSize: 10, fontWeight: 800, background: '#FEF2F2', color: '#EF4444', padding: '4px 8px', borderRadius: 999 }}>● Antirrábica vencida</span></div>
                    <div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo} • {c.motivo}</div>
                  </div>
                </div>
                <button onClick={() => mover(c.id, 'en_consulta')} style={{ width: '100%', marginTop: 16, height: 60, borderRadius: 24, background: '#16A34A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer', boxShadow: '0 4px 12px rgba(22,163,74,0.25)' }}>Pasar a BOX →</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>EN CONSULTA · {enConsulta.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {enConsulta.map((c) => (
              <div key={c.id} style={{ background: 'white', borderRadius: 20, padding: 16, border: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: 12 }}><div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{emoji(c.pacientes?.especie)}</div><div><div style={{ fontSize: 18, fontWeight: 800 }}>{c.pacientes?.nombre}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo}</div></div></div>
                <button onClick={() => mover(c.id, 'atendida')} style={{ width: '100%', marginTop: 16, height: 60, borderRadius: 24, background: '#0F172A', color: 'white', fontWeight: 700, fontSize: 14, border: 0, cursor: 'pointer' }}>Dar alta ✓</button>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12 }}>
          <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>LISTOS · {atendidas.length}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
            {atendidas.map((c) => (
              <div key={c.id} style={{ background: 'white', borderRadius: 20, padding: 16, opacity: 0.7, border: '1px solid rgba(0,0,0,0.04)' }}><div style={{ fontSize: 18, fontWeight: 800 }}>{c.pacientes?.nombre}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo}</div></div>
            ))}
          </div>
        </div>
      </div>

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600, zIndex: 50 }}>{toast}</div>}
    </div>
  )
}
