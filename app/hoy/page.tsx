
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Cita = {
  id: string
  fecha_hora: string
  estado: string
  motivo: string
  pacientes?: { nombre: string, especie: string }
  tutores?: { nombre_completo: string }
}

const MOCK: Cita[] = [
  { id: 'm1', fecha_hora: new Date().toISOString(), estado: 'agendada', motivo: 'Vacuna antirrabica', pacientes: { nombre: 'Milo', especie: 'canino' }, tutores: { nombre_completo: 'Bastian Gajardo' } },
  { id: 'm2', fecha_hora: new Date().toISOString(), estado: 'en_sala', motivo: 'Vomito 24h', pacientes: { nombre: 'Luna', especie: 'felino' }, tutores: { nombre_completo: 'Maria Perez' } },
  { id: 'm3', fecha_hora: new Date().toISOString(), estado: 'en_consulta', motivo: 'Control', pacientes: { nombre: 'Thor', especie: 'canino' }, tutores: { nombre_completo: 'Juan Soto' } },
  { id: 'm4', fecha_hora: new Date().toISOString(), estado: 'atendida', motivo: 'Desparasitacion', pacientes: { nombre: 'Coco', especie: 'canino' }, tutores: { nombre_completo: 'Ana Lopez' } },
]

const EMOJI: any = { canino: '🐶', felino: '🐱', otro: '🐾' }

export default function HoyFinal() {
  const [citas, setCitas] = useState<Cita[]>([])
  const [q, setQ] = useState('')
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    try {
      const hoy = new Date(); hoy.setHours(0,0,0,0)
      const { data } = await supabase.from('agenda')
        .select('id, fecha_hora, estado, motivo, pacientes(nombre, especie), tutores(nombre_completo)')
        .gte('fecha_hora', hoy.toISOString())
        .order('fecha_hora', { ascending: true }).limit(80)
      if (!data || data.length === 0) setCitas(MOCK)
      else setCitas(data as any)
    } catch { setCitas(MOCK) }
    setLoading(false)
  }

  function mover(id: string, nuevo: string) {
    setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: nuevo } : c))
    setToast(nuevo === 'en_sala' ? '✓ Check-in hecho' : nuevo === 'en_consulta' ? '→ En BOX' : '✓ Alta dada')
    setTimeout(() => setToast(''), 2000)
    supabase.from('agenda').update({ estado: nuevo }).eq('id', id).then(()=>{})
  }

  const filtradas = citas.filter(c => !q || c.pacientes!.nombre.toLowerCase().includes(q.toLowerCase()) || c.tutores!.nombre_completo.toLowerCase().includes(q.toLowerCase()))
  const col = (e: string) => filtradas.filter(c => c.estado === e)

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <style>{\`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');\`}</style>
      <div style={{ position: 'sticky', top: 0, background: 'rgba(255,251,247,0.9)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', zIndex: 20 }}>
        <div style={{ maxWidth: 1600, margin: '0 auto', padding: '14px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0F172A' }}>VetSimple</h1>
            <div style={{ display: 'flex', background: 'white', borderRadius: 999, padding: 4, border: '1px solid rgba(0,0,0,0.06)' }}>
              <span style={{ padding: '7px 18px', borderRadius: 999, background: '#0F172A', color: 'white', fontSize: 13, fontWeight: 700 }}>/HOY</span>
              <span style={{ padding: '7px 18px', borderRadius: 999, fontSize: 13, color: '#6b7280' }}>/BOX</span>
              <span style={{ padding: '7px 18px', borderRadius: 999, fontSize: 13, color: '#6b7280' }}>/CAJA</span>
            </div>
          </div>
          <div style={{ padding: '8px 14px', background: 'white', borderRadius: 999, border: '1px solid rgba(0,0,0,0.06)', fontSize: 12, fontWeight: 600 }}>
            {citas.length} hoy | $540.000 | <span style={{ color: '#16A34A' }}>0 no-shows</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: '20px 20px 0' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." style={{ width: '100%', height: 60, borderRadius: 24, background: 'white', border: '1px solid rgba(0,0,0,0.1)', padding: '0 20px 0 48px', fontSize: 16, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', outline: 'none' }} />
          <span style={{ position: 'absolute', left: 18, top: 19, color: '#9ca3af' }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {[
          { key: 'agendada', title: 'AGENDADOS', color: '#0F172A', label: 'Check-in → Sala' },
          { key: 'en_sala', title: 'EN SALA', color: '#16A34A', label: 'Pasar a BOX →', alert: true },
          { key: 'en_consulta', title: 'EN CONSULTA', color: '#0F172A', label: 'Dar alta ✓' },
          { key: 'atendida', title: 'LISTOS', color: 'white', label: 'Ver ficha' },
        ].map(colDef => {
          const items = col(colDef.key)
          return (
            <div key={colDef.key} style={{ background: colDef.key === 'en_sala' ? 'white' : 'rgba(243,238,232,0.65)', borderRadius: 20, padding: 12, border: colDef.key === 'en_sala' ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent' }}>
              <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(15,23,42,0.6)', padding: '8px 12px' }}>{colDef.title} · {items.length}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
                {items.map(c => (
                  <div key={c.id} style={{ background: 'white', borderRadius: 20, padding: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.04)' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: '#FFFBF7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{EMOJI[c.pacientes!.especie] || '🐾'}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <h4 style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{c.pacientes!.nombre}</h4>
                          {colDef.alert && <span style={{ fontSize: 10, fontWeight: 800, background: '#FEF2F2', color: '#EF4444', padding: '4px 8px', borderRadius: 999 }}>● Antirrábica vencida</span>}
                        </div>
                        <p style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores!.nombre_completo} • {c.motivo}</p>
                      </div>
                    </div>
                    <button onClick={() => mover(c.id, colDef.key === 'agendada' ? 'en_sala' : colDef.key === 'en_sala' ? 'en_consulta' : 'atendida')} style={{ width: '100%', marginTop: 16, height: 60, borderRadius: 24, background: colDef.color, color: colDef.color === 'white' ? '#0F172A' : 'white', fontWeight: 700, fontSize: 14, border: colDef.color === 'white' ? '1px solid rgba(0,0,0,0.1)' : '0', cursor: 'pointer', boxShadow: colDef.color === '#16A34A' ? '0 4px 12px rgba(22,163,74,0.25)' : 'none' }}>{colDef.label}</button>
                  </div>
                ))}
                {items.length === 0 && <div style={{ background: 'rgba(255,255,255,0.7)', border: '1px dashed rgba(0,0,0,0.12)', borderRadius: 20, padding: 28, textAlign: 'center', fontSize: 13, color: '#9ca3af' }}>Vacío</div>}
              </div>
            </div>
          )
        })}
      </div>
      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '12px 24px', borderRadius: 999, fontSize: 14, fontWeight: 600 }}>{toast}</div>}
      {loading && <div style={{ position: 'fixed', inset: 0, background: 'rgba(255,251,247,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>}
    </div>
  )
}
