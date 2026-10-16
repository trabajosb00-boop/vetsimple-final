'use client'
import { useState } from 'react'

type Paciente = {
  id: string
  nombre: string
  especie: string
  raza: string
  peso: number
  edad?: string
  etiquetas?: { nombre: string; color: string }[]
  tutor: { nombre: string; rut: string; tel: string; deuda?: number; etiquetas?: { nombre: string; color: string }[] }
  motivo: string
  motivo_completo?: string
  hora: string
  retraso?: string
  box?: string
  estado: 'agendada' | 'en_sala' | 'en_consulta' | 'atendida' | 'cobrada'
  tipo?: 'agendado' | 'sin_hora'
  hora_llegada?: string
  precio?: number
  borrador?: { nombre: string; precio: number; cant: number }[]
}

const MOCK: Paciente[] = [
  { id: '1', nombre: 'Milo', especie: 'canino', raza: 'Beagle', peso: 25, edad: '3a', etiquetas: [{ nombre: 'Crónico', color: '#EF4444' }], tutor: { nombre: 'Bastián G.', rut: '11.111.111-1', tel: '56912345678', deuda: 0, etiquetas: [{ nombre: 'VIP', color: '#10B981' }] }, motivo: 'Control anual + vacuna', motivo_completo: 'Control anual + vacuna antirrábica y desparasitación completa anual + revisión dental', hora: '09:03', retraso: '+3h2m', box: 'Box 1', estado: 'agendada', tipo: 'agendado', precio: 50000, borrador: [{ nombre: 'Consulta general', precio: 35000, cant: 1 }, { nombre: 'Vacuna antirrábica', precio: 15000, cant: 1 }] },
  { id: '2', nombre: 'Rocky', especie: 'canino', raza: 'Mestizo', peso: 18, edad: '2a', tutor: { nombre: 'Ana L.', rut: '22.222.222-2', tel: '56987654321', deuda: 15000 }, motivo: 'Cojera pata trasera derecha', motivo_completo: 'Cojera pata trasera derecha desde ayer, no apoya, llora al tocar', hora: '09:30', box: 'Box 2', estado: 'agendada', tipo: 'agendado', precio: 45000 },
  { id: '3', nombre: 'Thor', especie: 'canino', raza: 'Labrador', peso: 40, edad: '5a', tutor: { nombre: 'Javiera M.', rut: '13.222.333-4', tel: '56911223344', deuda: 0 }, motivo: 'Vómito hemático agudo', motivo_completo: 'Vómito hemático agudo, 2 episodios hoy AM, decaído', hora: '10:00', box: 'Box 1', estado: 'en_consulta', tipo: 'agendado', precio: 50000, borrador: [{ nombre: 'Consulta general', precio: 35000, cant: 1 }, { nombre: 'Vacuna óctuple', precio: 15000, cant: 1 }] },
  { id: '4', nombre: 'Almendra', especie: 'felino', raza: 'Mestizo', peso: 10, edad: '4a', etiquetas: [{ nombre: 'Geriátrico', color: '#8B5CF6' }], tutor: { nombre: 'Camila R.', rut: '14.444.444-4', tel: '56933445566', deuda: 0 }, motivo: 'Sin hora - Vómito y decaimiento', motivo_completo: 'Sin hora - Vómito y decaimiento 24h, no come, espontáneo', hora: '11:33', hora_llegada: '11:33', box: 'Box 2', estado: 'en_sala', tipo: 'sin_hora', precio: 50000 },
  { id: '5', nombre: 'Luna', especie: 'felino', raza: 'Siamés', peso: 4.5, tutor: { nombre: 'María P.', rut: '12.222.222-2', tel: '56999887766', deuda: 0 }, motivo: 'Control sano', motivo_completo: 'Control sano anual', hora: '08:30', box: 'Box 3', estado: 'atendida', tipo: 'agendado', precio: 50000, borrador: [{ nombre: 'Consulta general', precio: 35000, cant: 1 }, { nombre: 'Vacuna antirrábica', precio: 15000, cant: 1 }] },
]

const SERVICIOS_UPSELL = [
  { nombre: 'Alimento premium 7kg', precio: 24900 },
  { nombre: 'Collar isabelino', precio: 8900 },
  { nombre: 'Antiparasitario interno', precio: 12000 },
]

export default function HoyV3() {
  const [pacientes, setPacientes] = useState<Paciente[]>(MOCK)
  const [q, setQ] = useState('')
  const [showCobrar, setShowCobrar] = useState<Paciente | null>(null)
  const [showAtencion, setShowAtencion] = useState<Paciente | null>(null)
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [toast, setToast] = useState('')
  const [dragged, setDragged] = useState<string | null>(null)
  const [upselSeleccionados, setUpselSeleccionados] = useState<number[]>([])

  const agendados = pacientes.filter(p => p.estado === 'agendada')
  const enSala = pacientes.filter(p => p.estado === 'en_sala')
  const enConsulta = pacientes.filter(p => p.estado === 'en_consulta')
  const atendida = pacientes.filter(p => p.estado === 'atendida')

  function mover(id: string, nuevo: Paciente['estado']) {
    setPacientes(prev => prev.map(p => p.id === id ? { ...p, estado: nuevo } : p))
    if (nuevo === 'en_sala') setToast('✓ Check-in hecho')
    if (nuevo === 'en_consulta') {
      const pac = pacientes.find(p => p.id === id)
      if (pac) setShowAtencion(pac)
      setToast('→ En BOX - Ficha completa sin kanban')
    }
    if (nuevo === 'atendida') setToast('✓ Movido a ATENDIDA - Borrador $50k creado')
    setTimeout(() => setToast(''), 2500)
  }

  function openWhatsAppDirecto(tel: string, mensaje: string) {
    const cleanTel = tel.replace(/[^0-9]/g, '')
    const telConCodigo = cleanTel.startsWith('56') ? cleanTel : `56${cleanTel}`
    const url = `https://wa.me/${telConCodigo}?text=${encodeURIComponent(mensaje)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, sans-serif', color: '#0F172A' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');`}</style>

      <div style={{ position: 'sticky', top: 0, background: 'rgba(255,251,247,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', zIndex: 30, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#0F172A', color: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>VS</div>
          <div>
            <div style={{ fontWeight: 800 }}>VetSimple HOY V3 - Flujo completo</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{pacientes.length} hoy · $540.000 por cobrar · 2 no-shows</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => {
            const nombre = prompt('Nombre paciente sin hora?')
            if (!nombre) return
            const nuevo: Paciente = { id: Date.now().toString(), nombre, especie: 'canino', raza: 'Mestizo', peso: 10, tutor: { nombre: 'Sin tutor', rut: '', tel: '56912345678' }, motivo: 'Sin hora - motivo por preguntar', motivo_completo: 'Sin hora - motivo por preguntar en recepción', hora: new Date().toLocaleTimeString().slice(0,5), hora_llegada: new Date().toLocaleTimeString().slice(0,5), estado: 'en_sala', tipo: 'sin_hora', precio: 50000 }
            setPacientes(p => [...p, nuevo])
          }} style={{ padding: '10px 18px', borderRadius: 999, background: '#F97316', color: 'white', border: 0, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            🚶 Llegada sin hora
          </button>
          <button onClick={() => setShowNuevoCliente(true)} title="Nuevo cliente" style={{ width: 44, height: 44, borderRadius: 22, background: '#0F172A', color: 'white', border: 0, fontWeight: 800, cursor: 'pointer', fontSize: 18 }}>👤+</button>
          <button onClick={() => window.location.href = '/admin'} style={{ padding: '8px 14px', borderRadius: 999, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>⚙️ Admin $540k</button>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '12px auto 0', padding: '0 16px' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." style={{ width: '100%', height: 52, borderRadius: 20, background: 'white', border: '1px solid rgba(0,0,0,0.08)', padding: '0 16px 0 40px', outline: 'none' }} />
          <span style={{ position: 'absolute', left: 14, top: 16, color: '#9ca3af' }}>🔍</span>
        </div>
      </div>

      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { key: 'agendada' as const, title: 'AGENDADOS', color: '#DBEAFE', items: agendados },
          { key: 'en_sala' as const, title: 'EN SALA', color: '#FEF3C7', items: enSala },
          { key: 'en_consulta' as const, title: 'EN CONSULTA', color: '#D1FAE5', items: enConsulta },
          { key: 'atendida' as const, title: 'ATENDIDA / COBRADO', color: '#E9D5FF', items: atendida },
        ].map(col => (
          <div key={col.key} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragged) mover(dragged, col.key) }} style={{ background: col.color, borderRadius: 16, padding: 10, minHeight: 520, border: dragged ? '2px dashed #16A34A' : '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(0,0,0,0.6)', margin: '4px 8px 10px' }}>{col.title} · {col.items.length}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.items.filter(p => !q || p.nombre.toLowerCase().includes(q.toLowerCase())).map(p => (
                <div key={p.id} draggable onDragStart={() => setDragged(p.id)} onDragEnd={() => setDragged(null)}
                  style={{
                    background: 'white', borderRadius: 16, padding: 12,
                    borderLeft: p.tipo === 'sin_hora' ? '4px solid #F97316' : '1px solid rgba(0,0,0,0.05)',
                    borderTop: p.tipo === 'sin_hora' ? '1px solid #F97316' : '1px solid rgba(0,0,0,0.05)',
                    borderRight: p.tipo === 'sin_hora' ? '1px solid #F97316' : '1px solid rgba(0,0,0,0.05)',
                    borderBottom: p.tipo === 'sin_hora' ? '1px solid #F97316' : '1px solid rgba(0,0,0,0.05)',
                    opacity: dragged === p.id ? 0.5 : 1, cursor: 'grab', boxShadow: p.tipo === 'sin_hora' ? '0 4px 12px rgba(249,115,22,0.15)' : '0 2px 8px rgba(0,0,0,0.04)'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 10, color: '#6b7280', display: 'flex', gap: 6, alignItems: 'center' }}>
                      {p.hora} {p.tipo === 'sin_hora' ? (
                        <span style={{ background: '#F97316', color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontWeight: 800 }}>SIN HORA {p.hora_llegada}</span>
                      ) : `Agendado ${p.retraso || ''}`}
                    </div>
                    <span style={{ cursor: 'grab', color: '#9ca3af' }}>⋮⋮</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{p.nombre} {p.raza} {p.peso}kg</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{p.tutor.nombre} {p.tutor.rut}</div>
                  <div title={p.motivo_completo || p.motivo} style={{ fontSize: 11, color: '#374151', marginTop: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'help', borderBottom: '1px dotted #9ca3af' }}>
                    {p.motivo}
                  </div>
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {p.etiquetas?.map((et, i) => <span key={i} style={{ background: et.color, color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>{et.nombre}</span>)}
                    {p.tutor.etiquetas?.map((et, i) => <span key={'t' + i} style={{ background: et.color, color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 999 }}>{et.nombre}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {col.key === 'agendada' && <>
                      <button onClick={() => mover(p.id, 'en_sala')} style={{ flex: 1, height: 36, borderRadius: 12, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Check-in</button>
                      <button onClick={() => openWhatsAppDirecto(p.tutor.tel, `Hola ${p.tutor.nombre} confirmas hora de ${p.nombre} hoy ${p.hora}?`)} style={{ width: 32, height: 32, borderRadius: 16, background: '#25D366', color: 'white', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.91 9.91 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A9.91 9.91 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.5-8.47l-.45-.59zM12 22a9.9 9.9 0 0 1-5.07-1.4l-.36-.22-3.67.96.98-3.58-.23-.37A9.88 9.88 0 0 1 2 12C2 6.48 6.48 2 12 2c2.67 0 5.18 1.04 7.07 2.93A9.93 9.93 0 0 1 22 12c0 5.52-4.48 10-10 10z"/><path d="M16.6 14.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/></svg>
                      </button>
                    </>}
                    {col.key === 'en_sala' && <button onClick={() => mover(p.id, 'en_consulta')} style={{ width: '100%', height: 36, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Pasar a BOX →</button>}
                    {col.key === 'en_consulta' && <button onClick={() => setShowAtencion(p)} style={{ width: '100%', height: 36, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Ver atención - Modo foco</button>}
                    {col.key === 'atendida' && <button onClick={() => setShowCobrar(p)} style={{ flex: 1, height: 36, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cobrar ${p.precio?.toLocaleString('es-CL')}</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showCobrar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 420, background: 'white', height: '100%', overflow: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>Cobrar — {showCobrar.nombre}</div>
              <button onClick={() => setShowCobrar(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 12, padding: 12, border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: '#6b7280' }}>CUENTA ACTUAL - Borrador del médico</div>
              {showCobrar.borrador?.map((b, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 13 }}>
                  <span>{b.nombre} x{b.cant}</span><span>${(b.precio * b.cant).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, marginTop: 10, paddingTop: 8, borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <span>Total a cobrar</span><span>${showCobrar.precio?.toLocaleString('es-CL')}</span>
              </div>
            </div>
            <div style={{ marginTop: 12, background: '#FFFBF7', borderRadius: 12, padding: 12, border: '1px dashed #F59E0B' }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5, color: '#F59E0B' }}>AGREGAR VENTA - Upsell opcional</div>
              {SERVICIOS_UPSELL.map((s, idx) => {
                const selected = upselSeleccionados.includes(idx)
                return (
                  <div key={s.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, background: selected ? '#FEF3C7' : 'white', padding: '6px 10px', borderRadius: 8 }}>
                    <span style={{ fontSize: 12 }}>{s.nombre}</span>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 12 }}>${s.precio.toLocaleString()}</span>
                      <button onClick={() => setUpselSeleccionados(sel => sel.includes(idx) ? sel.filter(x => x !== idx) : [...sel, idx])} style={{ padding: '4px 10px', borderRadius: 999, background: selected ? '#F97316' : 'white', color: selected ? 'white' : '#0F172A', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11, cursor: 'pointer' }}>{selected ? 'Quitar' : '+ Agregar'}</button>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}>Transbank</button>
              <button style={{ flex: 1, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}>Transferencia</button>
              <button style={{ flex: 1, height: 36, borderRadius: 10, background: '#f3f4f6', border: '1px solid rgba(0,0,0,0.08)', fontSize: 12 }}>Efectivo</button>
            </div>
            <button onClick={() => {
              const tel = showCobrar.tutor.tel.replace(/[^0-9]/g, '')
              const total = (showCobrar.precio || 0) + SERVICIOS_UPSELL.filter((_, i) => upselSeleccionados.includes(i)).reduce((a, b) => a + b.precio, 0)
              const url = `https://wa.me/${tel.startsWith('56') ? tel : '56' + tel}?text=${encodeURIComponent(`Hola ${showCobrar.tutor.nombre}, total $${total.toLocaleString('es-CL')} por ${showCobrar.nombre}. Boleta enviada.`)}`
              window.open(url, '_blank', 'noopener,noreferrer')
              setToast(`✓ Cobrado $${total.toLocaleString()} y enviado por WA`)
              setShowCobrar(null)
              setUpselSeleccionados([])
              setTimeout(() => setToast(''), 2500)
            }} style={{ width: '100%', marginTop: 12, height: 48, borderRadius: 12, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Cobrar y enviar WhatsApp - directo</button>
          </div>
        </div>
      )}

      {showAtencion && (
        <AtencionTabs paciente={showAtencion} onClose={() => setShowAtencion(null)} onFinalizar={() => { mover(showAtencion.id, 'atendida'); setShowAtencion(null); setTimeout(() => setShowCobrar(pacientes.find(p => p.id === showAtencion.id) || showAtencion), 300) }} />
      )}

      {showNuevoCliente && <ModalNuevoCliente onClose={() => setShowNuevoCliente(false)} onCreate={(p: Paciente) => { setPacientes(prev => [...prev, p]); setShowNuevoCliente(false); setToast('✓ Tutor + paciente creado') }} />}

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '10px 20px', borderRadius: 999, fontSize: 13, zIndex: 100 }}>{toast}</div>}
    </div>
  )
}

function AtencionTabs({ paciente, onClose, onFinalizar }: { paciente: Paciente, onClose: () => void, onFinalizar: () => void }) {
  const [tab, setTab] = useState<'Anamnesis' | 'Examen' | 'Diagnóstico' | 'Tratamiento' | 'Ordenes' | 'Archivos'>('Anamnesis')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 60, overflow: 'auto' }}>
      <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', zIndex: 10 }}>
        <div style={{ padding: '10px 16px', background: '#FEF3C7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F59E0B' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13 }}>👤 Dueño: {paciente.tutor.nombre} / {paciente.tutor.rut} / 📞 {paciente.tutor.tel} / Deuda: ${paciente.tutor.deuda || 0}</div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>Paciente: {paciente.nombre} {paciente.raza} {paciente.peso}kg · {paciente.box} · Motivo: {paciente.motivo_completo}</div>
            </div>
            <button onClick={() => { const tel = paciente.tutor.tel.replace(/[^0-9]/g, ''); window.open(`https://wa.me/${tel.startsWith('56') ? tel : '56' + tel}?text=Hola ${paciente.tutor.nombre}`, '_blank') }} style={{ padding: '6px 12px', borderRadius: 999, background: '#25D366', color: 'white', border: 0, fontSize: 11, cursor: 'pointer' }}>📞 Llamar / WA dueño</button>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ padding: '6px 12px', borderRadius: 999, background: '#D1FAE5', fontSize: 11 }}>Focus mode - sin kanban atrás</span>
            <button onClick={onFinalizar} style={{ padding: '8px 16px', borderRadius: 999, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Finalizar → ATENDIDA y Cobrar</button>
            <button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, padding: '8px 16px', background: 'white', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
          {(['Anamnesis', 'Examen', 'Diagnóstico', 'Tratamiento', 'Ordenes', 'Archivos'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: 999, background: tab === t ? '#0F172A' : 'white', color: tab === t ? 'white' : '#0F172A', border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
        {tab === 'Anamnesis' && (
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 800 }}>ANAMNESIS - SAG exige motivo, anamnesis</h3>
            <textarea defaultValue="Vómito hemitico agudo, 2 episodios hoy - Almendra 10kg" style={{ width: '100%', minHeight: 60, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6 }} />
            <div style={{ fontSize: 11, color: '#6b7280', marginTop: 12 }}>Historia / Antecedentes / Alergias / Vacunas</div>
            <textarea defaultValue="Apetito disminuido 24h, sin diarrea. Vacunas al día." style={{ width: '100%', minHeight: 80, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 4 }} />
            <h3 style={{ fontSize: 12, fontWeight: 800, marginTop: 20 }}>CONSTANTES 35%</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
              {[{ k: 'TEMP', v: '38.5' }, { k: 'FC', v: '90' }, { k: 'FR', v: '24' }, { k: 'PESO', v: '10' }, { k: 'CC', v: '3/5' }, { k: 'CRT', v: '<2s' }].map(c => <div key={c.k} style={{ background: '#f9fafb', borderRadius: 10, padding: 8, border: '1px solid rgba(0,0,0,0.06)' }}><div style={{ fontSize: 9, color: '#6b7280' }}>{c.k}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{c.v}</div></div>)}
            </div>
          </div>
        )}
        {tab === 'Examen' && (
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 800 }}>EXAMEN FÍSICO POR SISTEMAS</h3>
            {[{ s: 'General', t: 'Alerta, decado leve' }, { s: 'Piel', t: 'Sin lesiones' }, { s: 'Cardio', t: 'Soplo II/VI' }].map(x => (
              <div key={x.s} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 10, marginTop: 8, display: 'flex', gap: 10 }}>
                <input type="checkbox" defaultChecked /><div style={{ flex: 1 }}><div style={{ fontSize: 11, fontWeight: 700 }}>{x.s}</div><textarea defaultValue={x.t} style={{ width: '100%', minHeight: 40, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, marginTop: 4, fontSize: 12 }} /></div>
              </div>
            ))}
          </div>
        )}
        {tab === 'Diagnóstico' && <div><h3 style={{ fontSize: 12, fontWeight: 800 }}>DIAGNÓSTICO</h3><input defaultValue="Gastritis hemorrágica - presuntivo" style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6, fontSize: 12 }} /></div>}
        {tab === 'Tratamiento' && <div><h3 style={{ fontSize: 12, fontWeight: 800 }}>TRATAMIENTO / RECETA + PDF</h3><textarea defaultValue="Omeprazol 1mg/kg EV" style={{ width: '100%', minHeight: 80, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6 }} /><div style={{ display: 'flex', gap: 8, marginTop: 12 }}><button style={{ flex: 1, height: 40, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>Receta PDF</button><button style={{ flex: 1, height: 40, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)' }}>Orden PDF</button></div></div>}
        {tab === 'Ordenes' && <div><h3 style={{ fontSize: 12, fontWeight: 800 }}>EXÁMENES - CATÁLOGO MODIFICABLE POR ADMIN</h3><div style={{ marginTop: 8 }}>Hemograma $12k, Perfil $18k, Rx $25k - checkbox + total</div></div>}
        {tab === 'Archivos' && <div><h3 style={{ fontSize: 12, fontWeight: 800 }}>ARCHIVOS</h3><div style={{ background: '#FFFBF7', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: 12, padding: 30, textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 8 }}>Drag & drop PDF JPG</div></div>}
      </div>
    </div>
  )
}

function ModalNuevoCliente({ onClose, onCreate }: { onClose: () => void, onCreate: (p: Paciente) => void }) {
  const [paso, setPaso] = useState(1)
  const [tutor, setTutor] = useState({ nombre: '', rut: '', tel: '', email: '', dir: '' })
  const [mascota, setMascota] = useState({ nombre: '', especie: 'canino', raza: 'Beagle', peso: '', microchip: '', esterilizado: 'Sí' })
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ width: 420, background: 'white', borderRadius: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}><div style={{ fontWeight: 800 }}>Nuevo cliente Paso {paso}/2</div><button onClick={onClose} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button></div>
        {paso === 1 ? (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={tutor.nombre} onChange={e => setTutor({ ...tutor, nombre: e.target.value })} placeholder="Nombre completo" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
            <input value={tutor.rut} onChange={e => setTutor({ ...tutor, rut: e.target.value })} placeholder="RUT" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
            <input value={tutor.tel} onChange={e => setTutor({ ...tutor, tel: e.target.value })} placeholder="Tel +569" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
            <button onClick={() => setPaso(2)} style={{ height: 44, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Siguiente → Datos mascota</button>
          </div>
        ) : (
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <input value={mascota.nombre} onChange={e => setMascota({ ...mascota, nombre: e.target.value })} placeholder="Nombre Almendra 10kg" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={mascota.especie} onChange={e => setMascota({ ...mascota, especie: e.target.value })} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}><option>canino</option><option>felino</option></select>
              <select value={mascota.raza} onChange={e => setMascota({ ...mascota, raza: e.target.value })} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}><option>Beagle</option><option>Mestizo</option><option>Labrador</option></select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={mascota.peso} onChange={e => setMascota({ ...mascota, peso: e.target.value })} placeholder="Peso 10kg" style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
              <select value={mascota.esterilizado} onChange={e => setMascota({ ...mascota, esterilizado: e.target.value })} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}><option>Sí</option><option>No</option></select>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => setPaso(1)} style={{ flex: 1, height: 44, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer' }}>Volver</button>
              <button onClick={() => onCreate({ id: Date.now().toString(), nombre: mascota.nombre || 'Almendra', especie: mascota.especie, raza: mascota.raza, peso: parseFloat(mascota.peso) || 10, tutor: { nombre: tutor.nombre || 'Bastián G.', rut: tutor.rut || '11.111.111-1', tel: tutor.tel || '56912345678' }, motivo: 'Nuevo cliente', hora: new Date().toLocaleTimeString().slice(0,5), estado: 'agendada', tipo: 'agendado', precio: 50000 })} style={{ flex: 1, height: 44, borderRadius: 12, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Crear</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
