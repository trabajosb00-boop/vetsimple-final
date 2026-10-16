'use client'
import { useEffect, useState, useRef } from 'react'

type Paciente = {
  id: string
  nombre: string
  especie: string
  raza: string
  peso: number
  microchip?: string
  esterilizado?: string
  edad?: string
  etiquetas?: { nombre: string; color: string }[]
  tutor: { nombre: string; rut: string; tel: string; email?: string; etiquetas?: { nombre: string; color: string }[] }
  motivo: string
  hora: string
  retraso?: string
  box?: string
  estado: 'agendada' | 'en_sala' | 'en_consulta' | 'atendida'
  tipo?: 'agendado' | 'sin_hora'
  hora_llegada?: string
  precio?: number
  borrador?: { nombre: string; precio: number; cant: number }[]
}

const MOCK: Paciente[] = [
  { id: '1', nombre: 'Milo', especie: 'canino', raza: 'Beagle', peso: 22, microchip: '900141000000001', esterilizado: 'Sí', edad: '3a 2m', etiquetas: [{ nombre: 'Crónico', color: '#EF4444' }, { nombre: 'Cachorro', color: '#06B6D4' }], tutor: { nombre: 'Bastián G.', rut: '11.111.111-1', tel: '+56912345678', email: 'bastian@mail.cl', etiquetas: [{ nombre: 'VIP', color: '#10B981' }] }, motivo: 'Control anual + vacuna antirrábica', hora: '09:03', retraso: '+3h2m', box: 'Box 1', estado: 'agendada', tipo: 'agendado', precio: 50000, borrador: [{ nombre: 'Consulta general', precio: 35000, cant: 1 }, { nombre: 'Vacuna antirrábica', precio: 15000, cant: 1 }] },
  { id: '2', nombre: 'Luna', especie: 'felino', raza: 'Siamés', peso: 4.5, microchip: '900141000000002', esterilizado: 'No', edad: '2a', etiquetas: [{ nombre: 'Alérgica', color: '#F59E0B' }], tutor: { nombre: 'María P.', rut: '12.222.222-2', tel: '+56987654321', etiquetas: [{ nombre: 'Nuevo', color: '#3B82F6' }] }, motivo: 'Vómito 24h', hora: '10:15', box: 'Box 2', estado: 'en_sala', tipo: 'agendado', precio: 45000 },
  { id: '3', nombre: 'Thor', especie: 'canino', raza: 'Labrador', peso: 30, microchip: '900141000000003', esterilizado: 'Sí', edad: '5a', etiquetas: [{ nombre: 'Agresivo', color: '#DC2626' }], tutor: { nombre: 'Javiera M.', rut: '13.222.333-4', tel: '+56911223344', etiquetas: [{ nombre: 'Frecuente', color: '#8B5CF6' }] }, motivo: 'Vómito hemático agudo', hora: '11:20', box: 'Box 1', estado: 'en_consulta', tipo: 'agendado', precio: 50000, borrador: [{ nombre: 'Consulta general', precio: 35000, cant: 1 }, { nombre: 'Vacuna óctuple', precio: 15000, cant: 1 }] },
  { id: '4', nombre: 'Coco', especie: 'canino', raza: 'Mestizo', peso: 4.5, microchip: '900141000000004', esterilizado: 'Sí', edad: '1a', etiquetas: [{ nombre: 'Geriátrico', color: '#8B5CF6' }], tutor: { nombre: 'Bastián G.', rut: '11.111.111-1', tel: '+56912345678', etiquetas: [{ nombre: 'VIP', color: '#10B981' }] }, motivo: 'Vacuna', hora: '08:30', box: 'Box 3', estado: 'atendida', tipo: 'agendado', precio: 50000, borrador: [{ nombre: 'Consulta general', precio: 35000, cant: 1 }, { nombre: 'Vacuna antirrábica', precio: 15000, cant: 1 }] },
  { id: '5', nombre: 'Rocky', especie: 'canino', raza: 'Mestizo', peso: 15, microchip: '900141000000005', esterilizado: 'No', edad: '2a', etiquetas: [], tutor: { nombre: 'Carlos R.', rut: '55.555.555-5', tel: '+56955555555', etiquetas: [] }, motivo: 'Sin hora - Vómito', hora: '10:24', hora_llegada: '10:24', box: 'Box 1', estado: 'en_sala', tipo: 'sin_hora', precio: 45000 },
]

const SERVICIOS = [
  { nombre: 'Consulta general', precio: 35000, categoria: 'Consulta' },
  { nombre: 'Vacuna antirrábica', precio: 15000, categoria: 'Vacuna' },
  { nombre: 'Vacuna óctuple', precio: 15000, categoria: 'Vacuna' },
  { nombre: 'Desparasitación', precio: 10000, categoria: 'Preventivo' },
  { nombre: 'Corte uñas', precio: 8000, categoria: 'Estética' },
  { nombre: 'Hospital día', precio: 25000, categoria: 'Hospital' },
  { nombre: 'Hemograma completo', precio: 12000, categoria: 'Lab' },
  { nombre: 'Perfil bioquímico 12 paráms', precio: 18000, categoria: 'Lab' },
  { nombre: 'Rx tórax 2 proyecciones', precio: 25000, categoria: 'Imagen' },
  { nombre: 'Eco abdominal completa', precio: 35000, categoria: 'Imagen' },
  { nombre: 'Collar isabelino', precio: 8900, categoria: 'Producto' },
  { nombre: 'Alimento premium 7kg', precio: 24900, categoria: 'Producto' },
]

export default function HoyPage() {
  const [pacientes, setPacientes] = useState<Paciente[]>(MOCK)
  const [q, setQ] = useState('')
  const [showEquipo, setShowEquipo] = useState(false)
  const [showTutores, setShowTutores] = useState(false)
  const [showCobrar, setShowCobrar] = useState<Paciente | null>(null)
  const [showAtencion, setShowAtencion] = useState<Paciente | null>(null)
  const [showNuevoCliente, setShowNuevoCliente] = useState(false)
  const [showSinHoraBanner, setShowSinHoraBanner] = useState(true)
  const [sinHoraQ, setSinHoraQ] = useState('')
  const [equipoMensajes, setEquipoMensajes] = useState([
    { id: 1, canal: '#box-1', autor: 'Dra. María', texto: 'Milo en Box 2 vomitó sangre ven a ver @Bastian', urgente: true, hora: '11:10' },
    { id: 2, canal: '#box-1', autor: 'Técnico Juan', texto: 'Listo Thor en Box 1', urgente: false, hora: '11:15' },
  ])
  const [equipoInput, setEquipoInput] = useState('')
  const [equipoCanal, setEquipoCanal] = useState('#box-1')
  const [tutorMensajes, setTutorMensajes] = useState([
    { id: 1, tutor: 'Bastián G.', texto: '¿A qué hora retiro a Milo?', tipo: 'in', hora: '11:05' },
    { id: 2, tutor: 'Bastián G.', texto: 'Hola Bastián Milo agendado hoy 09:00 Box 2 ¿Confirmas? Sí/No', tipo: 'out', hora: '11:12', estado: '✓✓' },
  ])
  const [tutorInput, setTutorInput] = useState('')
  const [dragged, setDragged] = useState<string | null>(null)
  const [toast, setToast] = useState('')
  const [nuevoTutor, setNuevoTutor] = useState({ nombre: '', rut: '', tel: '', email: '', dir: '' })
  const [nuevaMascota, setNuevaMascota] = useState({ nombre: '', especie: 'canino', raza: 'Beagle', peso: '', microchip: '', esterilizado: 'Sí', nacimiento: '', color: '' })
  const [pasoCliente, setPasoCliente] = useState(1)

  const hoy = pacientes.filter(p => p.estado !== 'atendida' || true) // solo del día
  const agendados = pacientes.filter(p => p.estado === 'agendada')
  const enSala = pacientes.filter(p => p.estado === 'en_sala')
  const enConsulta = pacientes.filter(p => p.estado === 'en_consulta')
  const atendida = pacientes.filter(p => p.estado === 'atendida')

  function mover(id: string, nuevo: Paciente['estado']) {
    setPacientes(prev => prev.map(p => p.id === id ? { ...p, estado: nuevo } : p))
    setToast(nuevo === 'en_sala' ? '✓ Check-in hecho' : nuevo === 'en_consulta' ? '→ En BOX - Abriendo atención' : nuevo === 'atendida' ? '✓ Movido a ATENDIDA - Borrador $50.000 creado' : '')
    setTimeout(() => setToast(''), 3000)
    if (nuevo === 'en_consulta') {
      const pac = pacientes.find(p => p.id === id)
      if (pac) setShowAtencion(pac)
    }
    if (nuevo === 'atendida') {
      const pac = pacientes.find(p => p.id === id)
      if (pac) setShowCobrar(pac)
    }
  }

  function finalizarAtencion() {
    if (!showAtencion) return
    mover(showAtencion.id, 'atendida')
    setShowAtencion(null)
    // muestra cobro como antes
    setTimeout(() => {
      const pac = pacientes.find(p => p.id === showAtencion.id)
      if (pac) setShowCobrar({ ...pac, estado: 'atendida' })
    }, 300)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, system-ui, sans-serif', color: '#0F172A' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');`}</style>

      {/* HEADER */}
      <div style={{ position: 'sticky', top: 0, background: 'rgba(255,251,247,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.06)', zIndex: 30, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, background: '#0F172A', color: 'white', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>VS</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 16 }}>VetSimple HOY</div>
            <div style={{ fontSize: 11, color: '#6b7280' }}>Mié 15 oct · {pacientes.length} pacientes · ${pacientes.reduce((a, b) => a + (b.precio || 0), 0).toLocaleString('es-CL')} por cobrar</div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginLeft: 12, fontSize: 11 }}>
            <span style={{ background: '#DBEAFE', padding: '4px 8px', borderRadius: 999 }}>{agendados.length} agendados</span>
            <span style={{ background: '#FEF3C7', padding: '4px 8px', borderRadius: 999 }}>{enSala.length} en sala</span>
            <span style={{ background: '#D1FAE5', padding: '4px 8px', borderRadius: 999 }}>{enConsulta.length} en consulta</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: '#6b7280' }}>Aseo · Facturas · Stock · Formularios · Auditorías</span>
          <button onClick={() => setShowNuevoCliente(true)} title="Nuevo cliente" style={{ width: 40, height: 40, borderRadius: 20, background: '#0F172A', color: 'white', border: 0, cursor: 'pointer', fontSize: 20 }}>👤+</button>
          <button onClick={() => window.location.href = '/admin'} style={{ padding: '8px 12px', borderRadius: 999, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12, fontWeight: 700 }}>⚙️ Admin</button>
        </div>
      </div>

      {/* BANNER SIN HORA - BUSQUEDA PARA AGREGAR A SALA */}
      {showSinHoraBanner && (
        <div style={{ maxWidth: 1600, margin: '12px auto 0', padding: '0 16px' }}>
          <div style={{ background: '#FEF3C7', border: '2px dashed #F59E0B', borderRadius: 16, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>🔍</span>
            <input value={sinHoraQ} onChange={e => setSinHoraQ(e.target.value)} placeholder="Buscar paciente para agregar a sala de espera - escribe Milo, RUT, microchip..." style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px', outline: 'none' }} />
            <button onClick={() => {
              if (!sinHoraQ) return
              const nuevo: Paciente = { id: Date.now().toString(), nombre: sinHoraQ, especie: 'canino', raza: 'Mestizo', peso: 10, tutor: { nombre: 'Sin tutor', rut: '', tel: '' }, motivo: 'Sin hora', hora: new Date().toLocaleTimeString().slice(0,5), hora_llegada: new Date().toLocaleTimeString().slice(0,5), estado: 'en_sala', tipo: 'sin_hora', precio: 45000 }
              setPacientes(p => [...p, nuevo])
              setSinHoraQ('')
              setToast('✓ Agregado a sala de espera ⏰ Sin hora')
              setTimeout(() => setToast(''), 2000)
            }} style={{ padding: '8px 16px', borderRadius: 999, background: '#F59E0B', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Agregar sin hora naranja</button>
            <button onClick={() => setShowSinHoraBanner(false)} style={{ background: 'transparent', border: 0, cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div style={{ maxWidth: 1600, margin: '12px auto 0', padding: '0 16px' }}>
        <div style={{ position: 'relative' }}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Busca Milo, RUT, microchip 900..." style={{ width: '100%', height: 52, borderRadius: 20, background: 'white', border: '1px solid rgba(0,0,0,0.08)', padding: '0 16px 0 40px', outline: 'none' }} />
          <span style={{ position: 'absolute', left: 14, top: 16, color: '#9ca3af' }}>🔍</span>
        </div>
      </div>

      {/* KANBAN PASTEL */}
      <div style={{ maxWidth: 1600, margin: '0 auto', padding: 16, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { key: 'agendada' as const, title: 'AGENDADOS', color: '#DBEAFE', items: agendados },
          { key: 'en_sala' as const, title: 'EN SALA', color: '#FEF3C7', items: enSala },
          { key: 'en_consulta' as const, title: 'EN CONSULTA', color: '#D1FAE5', items: enConsulta },
          { key: 'atendida' as const, title: 'ATENDIDA', color: '#E9D5FF', items: atendida },
        ].map(col => (
          <div key={col.key} onDragOver={e => e.preventDefault()} onDrop={() => { if (dragged) mover(dragged, col.key) }} style={{ background: col.color, borderRadius: 16, padding: 10, minHeight: 500, border: dragged ? '2px dashed #16A34A' : '1px solid rgba(0,0,0,0.04)' }}>
            <h3 style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'rgba(0,0,0,0.6)', margin: '4px 8px 10px' }}>{col.title} · {col.items.length}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {col.items.filter(p => !q || p.nombre.toLowerCase().includes(q.toLowerCase()) || p.tutor.nombre.toLowerCase().includes(q.toLowerCase())).map(p => (
                <div key={p.id} draggable onDragStart={() => setDragged(p.id)} onDragEnd={() => setDragged(null)} style={{ background: 'white', borderRadius: 16, padding: 12, border: p.tipo === 'sin_hora' ? '2px solid #F59E0B' : '1px solid rgba(0,0,0,0.05)', opacity: dragged === p.id ? 0.5 : 1, cursor: 'grab', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 10, color: '#6b7280' }}>{p.hora} {p.tipo === 'sin_hora' ? `· ⏰ Sin hora ${p.hora_llegada}` : `Agendado ${p.retraso || ''}`}</div>
                    <span style={{ cursor: 'grab', color: '#9ca3af' }}>⋮⋮</span>
                  </div>
                  <div style={{ fontWeight: 800, fontSize: 14, marginTop: 4 }}>{p.nombre} {p.raza} {p.peso}kg {p.tipo === 'sin_hora' && <span style={{ background: '#FEF3C7', color: '#F59E0B', fontSize: 10, padding: '2px 6px', borderRadius: 999 }}>⏰ Sin hora</span>}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>{p.tutor.nombre} {p.tutor.rut}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>{p.motivo}</div>
                  {/* etiquetas visibles con color */}
                  <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                    {p.etiquetas?.map((et, i) => <span key={i} style={{ background: et.color, color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 999, fontWeight: 700 }}>{et.nombre}</span>)}
                    {p.tutor.etiquetas?.map((et, i) => <span key={'t' + i} style={{ background: et.color, color: 'white', fontSize: 9, padding: '2px 6px', borderRadius: 999 }}>{et.nombre}</span>)}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                    {col.key === 'agendada' && <>
                      <button onClick={() => mover(p.id, 'en_sala')} style={{ flex: 1, height: 36, borderRadius: 12, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Check-in</button>
                      <button onClick={() => { if (confirm('¿No vino? ¿Reagendar?')) { const d = prompt('Fecha YYYY-MM-DD'); const h = prompt('Hora 09:00'); if (d) setToast(`✓ Reagendado para ${d} ${h}`) } }} style={{ padding: '0 8px', borderRadius: 10, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11, cursor: 'pointer' }}>No vino</button>
                      <button onClick={() => window.open(`https://wa.me/${p.tutor.tel.replace(/[^0-9]/g, '')}?text=Hola ${p.tutor.nombre} confirmas hora de ${p.nombre}?`, '_blank')} style={{ width: 32, height: 32, borderRadius: 16, background: '#25D366', color: 'white', border: 0, cursor: 'pointer' }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.91 9.91 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A9.91 9.91 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.5-8.47l-.45-.59zM12 22a9.9 9.9 0 0 1-5.07-1.4l-.36-.22-3.67.96.98-3.58-.23-.37A9.88 9.88 0 0 1 2 12C2 6.48 6.48 2 12 2c2.67 0 5.18 1.04 7.07 2.93A9.93 9.93 0 0 1 22 12c0 5.52-4.48 10-10 10z"/><path d="M16.6 14.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/></svg>
                      </button>
                    </>}
                    {col.key === 'en_sala' && <button onClick={() => mover(p.id, 'en_consulta')} style={{ width: '100%', height: 36, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Pasar a BOX →</button>}
                    {col.key === 'en_consulta' && <button onClick={() => { const pac = pacientes.find(x => x.id === p.id); if (pac) setShowAtencion(pac) }} style={{ width: '100%', height: 36, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Ver atención</button>}
                    {col.key === 'atendida' && <>
                      <button onClick={() => setShowCobrar(p)} style={{ flex: 1, height: 36, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>Cobrar ${p.precio?.toLocaleString('es-CL')}</button>
                      <span style={{ fontSize: 10, background: '#D1FAE5', color: '#16A34A', padding: '4px 8px', borderRadius: 999 }}>Enviado por WA ✓</span>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* FABs CHATS CORREGIDOS */}
      <button onClick={() => setShowEquipo(true)} style={{ position: 'fixed', bottom: 20, left: 20, padding: '10px 16px', borderRadius: 999, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer', zIndex: 40 }}>💬 Equipo 1</button>
      <button onClick={() => setShowTutores(true)} style={{ position: 'fixed', bottom: 20, right: 20, padding: '10px 16px', borderRadius: 999, background: '#25D366', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer', zIndex: 40 }}>💬 Tutores 1</button>

      {/* CHAT EQUIPO - CORREGIDO CON WHATSAPP USUARIOS ADMIN */}
      {showEquipo && (
        <div style={{ position: 'fixed', bottom: 70, left: 20, width: 380, height: 460, background: 'white', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 50, display: 'flex', flexDirection: 'column', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ padding: 12, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontWeight: 800 }}>Equipo - solo presentes</div>
            <button onClick={() => setShowEquipo(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ display: 'flex', gap: 6, padding: 8, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            {['#box-1', '#box-2', '#recepcion', '#hospitalizados'].map(c => <button key={c} onClick={() => setEquipoCanal(c)} style={{ padding: '4px 8px', borderRadius: 999, border: 0, background: equipoCanal === c ? '#DBEAFE' : '#f3f4f6', fontSize: 11, cursor: 'pointer' }}>{c}</button>)}
          </div>
          <div style={{ flex: 1, overflow: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {equipoMensajes.filter(m => m.canal === equipoCanal).map(m => (
              <div key={m.id} style={{ background: m.urgente ? '#FEF2F2' : '#f9fafb', border: m.urgente ? '1px solid #FECACA' : '1px solid transparent', borderRadius: 12, padding: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700 }}>{m.autor} {m.urgente && <span style={{ background: '#EF4444', color: 'white', padding: '2px 6px', borderRadius: 999, fontSize: 9 }}>🔴 Urgente</span>}</div>
                <div style={{ fontSize: 13, marginTop: 4 }}>{m.texto}</div>
                <div style={{ fontSize: 10, color: '#6b7280', marginTop: 4 }}>{m.hora} • <button onClick={() => window.open(`https://wa.me/56912345678?text=${encodeURIComponent(m.texto)}`, '_blank')} style={{ background: '#25D366', color: 'white', border: 0, borderRadius: 999, padding: '2px 8px', fontSize: 10, cursor: 'pointer' }}>WhatsApp</button></div>
              </div>
            ))}
          </div>
          <div style={{ padding: 10, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 6 }}>
            <input value={equipoInput} onChange={e => setEquipoInput(e.target.value)} placeholder="Mensaje equipo @Bastian..." style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
            <button onClick={() => { if (!equipoInput) return; setEquipoMensajes(m => [...m, { id: Date.now(), canal: equipoCanal, autor: 'Yo', texto: equipoInput, urgente: false, hora: new Date().toLocaleTimeString().slice(0,5) }]); setEquipoInput(''); setToast('✓ Mensaje equipo enviado') }} style={{ padding: '0 14px', borderRadius: 10, background: '#0F172A', color: 'white', border: 0, cursor: 'pointer' }}>Enviar</button>
            <button onClick={() => { setEquipoMensajes(m => [...m, { id: Date.now(), canal: equipoCanal, autor: 'Yo', texto: '🔴 URGENTE ' + (equipoInput || 'Revisar Box'), urgente: true, hora: new Date().toLocaleTimeString().slice(0,5) }]); setEquipoInput('') }} style={{ padding: '0 10px', borderRadius: 10, background: '#EF4444', color: 'white', border: 0, cursor: 'pointer' }}>🔴 Urgente</button>
          </div>
        </div>
      )}

      {/* INBOX TUTORES - SOLO DEL DIA */}
      {showTutores && (
        <div style={{ position: 'fixed', bottom: 70, right: 20, width: 420, height: 460, background: 'white', borderRadius: 16, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', zIndex: 50, display: 'flex', border: '1px solid rgba(0,0,0,0.08)' }}>
          <div style={{ width: 140, borderRight: '1px solid rgba(0,0,0,0.08)', overflow: 'auto' }}>
            <div style={{ padding: 10, fontSize: 11, fontWeight: 800, borderBottom: '1px solid rgba(0,0,0,0.06)' }}>Tutores hoy</div>
            {pacientes.filter(p => p.estado !== 'atendida').map(p => (
              <div key={p.id} style={{ padding: '10px', borderBottom: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', background: p.id === '1' ? '#f0fdf4' : 'white' }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{p.tutor.nombre} - {p.nombre}</div>
                <div style={{ fontSize: 10, color: '#6b7280' }}>hace 5m · ¿A qué hora retiro?</div>
                {p.id === '1' && <span style={{ background: '#FEF3C7', fontSize: 9, padding: '2px 6px', borderRadius: 999 }}>Por cobrar ${p.precio?.toLocaleString()}</span>}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: 10, borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>Bastián G. - Milo</div>
              <button onClick={() => setShowTutores(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ flex: 1, padding: 12, display: 'flex', flexDirection: 'column', gap: 8, overflow: 'auto' }}>
              {tutorMensajes.map(m => (
                <div key={m.id} style={{ alignSelf: m.tipo === 'in' ? 'flex-start' : 'flex-end', background: m.tipo === 'in' ? '#f3f4f6' : '#D1FAE5', borderRadius: 12, padding: '8px 12px', maxWidth: '80%', fontSize: 13 }}>
                  {m.texto} <span style={{ fontSize: 10, color: '#6b7280' }}>{m.hora} {m.estado}</span>
                </div>
              ))}
            </div>
            <div style={{ padding: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {['Confirmar 24h', 'Retraso 15m', 'Listo retiro', 'Boleta $45k', 'Receta SAG'].map(t => <button key={t} onClick={() => setTutorInput(t)} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 999, background: '#f3f4f6', border: 0, cursor: 'pointer' }}>{t}</button>)}
            </div>
            <div style={{ padding: 10, borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', gap: 6 }}>
              <input value={tutorInput} onChange={e => setTutorInput(e.target.value)} placeholder="Escribir por WhatsApp..." style={{ flex: 1, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
              <button onClick={() => {
                if (!tutorInput) return
                setTutorMensajes(m => [...m, { id: Date.now(), tutor: 'Bastián G.', texto: tutorInput, tipo: 'out', hora: new Date().toLocaleTimeString().slice(0,5), estado: '✓✓' }])
                window.open(`https://wa.me/56912345678?text=${encodeURIComponent(tutorInput)}`, '_blank')
                setTutorInput('')
              }} style={{ padding: '0 12px', borderRadius: 10, background: '#25D366', color: 'white', border: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M19.05 4.94A9.91 9.91 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.16 1.6 5.97L0 24l6.18-1.62A9.91 9.91 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.5-8.47l-.45-.59zM12 22a9.9 9.9 0 0 1-5.07-1.4l-.36-.22-3.67.96.98-3.58-.23-.37A9.88 9.88 0 0 1 2 12C2 6.48 6.48 2 12 2c2.67 0 5.18 1.04 7.07 2.93A9.93 9.93 0 0 1 22 12c0 5.52-4.48 10-10 10z"/><path d="M16.6 14.2c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.14-.42-2.17-1.34-.8-.71-1.34-1.59-1.5-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.32.4-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.44-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.96.94-.96 2.29s.98 2.66 1.12 2.84c.14.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.66.21 1.26.18 1.73.11.53-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"/></svg> Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VENTANA ATENCIÓN TÉCNICA RESTAURADA */}
      {showAtencion && (
        <div style={{ position: 'fixed', inset: 0, background: 'white', zIndex: 60, overflow: 'auto' }}>
          <div style={{ position: 'sticky', top: 0, background: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 800 }}>{showAtencion.nombre} {showAtencion.raza} {showAtencion.peso}kg 5a ME 900034... </div>
              <div style={{ fontSize: 11, color: '#6b7280' }}>{showAtencion.tutor.nombre} {showAtencion.tutor.rut} | {showAtencion.box} | 12:34 • Guardado borrador auto cada 10s</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ padding: '6px 12px', borderRadius: 999, background: '#D1FAE5', fontSize: 11 }}>Focus mode</span>
              <button onClick={finalizarAtencion} style={{ padding: '8px 16px', borderRadius: 999, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Finalizar → ATENDIDA</button>
              <button onClick={() => setShowAtencion(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
          </div>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: 20, display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
            <div>
              <h3 style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>ANAMNESIS</h3>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 6 }}>Motivo consulta (técnico)</div>
              <textarea defaultValue="Vómito hemático agudo, 2 episodios hoy AM" style={{ width: '100%', minHeight: 60, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 4 }} />
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 12 }}>Historia / Antecedentes / Alergias / Vacunas / Desparasitación</div>
              <textarea defaultValue="Apetito disminuido 24h, sin diarrea, sin ingesta cuerpos extraños conocida. Vacunas al día, desparasitación hace 1 mes. Alergia a penicilina." style={{ width: '100%', minHeight: 70, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 4 }} />

              <h3 style={{ fontSize: 12, fontWeight: 800, marginTop: 20 }}>CONSTANTES FISIOLÓGICAS</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginTop: 8 }}>
                {[
                  { k: 'TEMP', v: '38.5' }, { k: 'FC', v: '90' }, { k: 'FR', v: '24' }, { k: 'PESO', v: '22' },
                  { k: 'CC', v: '3/5' }, { k: 'CRT', v: '<2s' }, { k: 'PULSO', v: 'fuerte simétrico' }, { k: 'MUCOSAS', v: 'rosadas' },
                  { k: 'HIDRATACION', v: '5%' }, { k: 'PA', v: '120/80' },
                ].map(c => <div key={c.k} style={{ background: '#f9fafb', borderRadius: 10, padding: 8, border: '1px solid rgba(0,0,0,0.06)' }}><div style={{ fontSize: 9, color: '#6b7280' }}>{c.k}</div><div style={{ fontSize: 12, fontWeight: 700 }}>{c.v}</div></div>)}
              </div>
              <div style={{ background: '#D1FAE5', borderRadius: 10, padding: '8px 12px', fontSize: 11, marginTop: 8, textAlign: 'center', color: '#065f46' }}>Peso 22kg sparkline 21.8 - 22.0 - 22.1 kg (7 días)</div>

              <h3 style={{ fontSize: 12, fontWeight: 800, marginTop: 20 }}>EXAMEN CLÍNICO POR SISTEMAS</h3>
              {[
                { s: 'General', t: 'Alerta, decado leve, condición corporal 3/5' },
                { s: 'Piel', t: 'Sin lesiones' },
                { s: 'Linfonodos', t: 'Submandibulares levemente aumentados' },
                { s: 'Cardio', t: 'Soplo II/VI foco mitra' },
                { s: 'Resp', t: 'Murmullo vesicular normal' },
                { s: 'Digest', t: 'Dolor epigastrio a palpación' },
                { s: 'Musc', t: 'Sin cojera' },
                { s: 'Neuro', t: 'Reflejos normales' },
              ].map(x => (
                <div key={x.s} style={{ background: 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 12, padding: 10, marginTop: 8, display: 'flex', gap: 10 }}>
                  <input type="checkbox" defaultChecked style={{ marginTop: 4 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{x.s}</div>
                    <textarea defaultValue={x.t} style={{ width: '100%', minHeight: 40, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, marginTop: 4, fontSize: 12 }} />
                  </div>
                </div>
              ))}

              <h3 style={{ fontSize: 11, fontWeight: 800, marginTop: 20 }}>EXÁMENES DIAGNÓSTICOS REQUERIDOS (CATÁLOGO PREDEFINIDO MODIFICABLE POR ADMIN)</h3>
              {[
                { n: 'Hemograma completo', cat: 'Hematología', precio: 12000, check: true },
                { n: 'Perfil bioquímico 12 paráms', cat: 'Bioquímica', precio: 18000, check: true },
                { n: 'Urianálisis', cat: 'Orina', precio: 10000, check: false },
                { n: 'Rx tórax 2 proyecciones', cat: 'Imagen', precio: 25000, check: true },
                { n: 'Eco abdominal completa', cat: 'Imagen', precio: 35000, check: false },
                { n: 'Test 4Dx', cat: 'Infecciosas', precio: 22000, check: false },
              ].map(e => (
                <div key={e.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: e.check ? '#DBEAFE' : 'white', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, padding: '8px 12px', marginTop: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" defaultChecked={e.check} />
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{e.n}</span>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>{e.cat}</span>
                  </div>
                  <span style={{ fontSize: 11 }}>${e.precio.toLocaleString('es-CL')}</span>
                </div>
              ))}
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 700, marginTop: 8 }}>Total exámenes: $55.000</div>

              <h3 style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>AÑADIR ARCHIVOS</h3>
              <div style={{ background: '#FFFBF7', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: 12, padding: 20, textAlign: 'center', fontSize: 12, color: '#6b7280', marginTop: 6 }}>Drag & drop Rx, labs, fotos — o click para subir (PDF, JPG)</div>
            </div>

            <div>
              <h3 style={{ fontSize: 11, fontWeight: 800 }}>DIAGNÓSTICO (CIE VETERINARIO)</h3>
              <input defaultValue="Gastritis hemorrágica - presuntivo. Descartar cuerpo extraño / ulceración" style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6, fontSize: 12 }} />
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <span style={{ background: '#FEF3C7', padding: '4px 8px', borderRadius: 999, fontSize: 10 }}>Presuntivo</span>
                <span style={{ background: '#f3f4f6', padding: '4px 8px', borderRadius: 999, fontSize: 10 }}>Definitivo</span>
              </div>

              <h3 style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>TRATAMIENTO / PROCEDIMIENTOS (PARA BORRADOR VENTA)</h3>
              <textarea defaultValue="Omeprazol 1mg/kg EV, Maropitant 1mg/kg SC, Fluidoterapia Ringer 20ml/kg" style={{ width: '100%', minHeight: 70, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6, fontSize: 12 }} />
              <div style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: 10, marginTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>Consulta genera</span><span>$35.000</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}><span>Vacuna óctuple</span><span>$15.000</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 800, marginTop: 6, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 6 }}><span>Total borrador</span><span>$50.000</span></div>
              </div>

              <h3 style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>RECETA</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 0.7fr 0.7fr 0.5fr', gap: 6, marginTop: 6 }}>
                <input defaultValue="Omeprazol 20mg" style={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, fontSize: 12 }} />
                <input defaultValue="1 cap" style={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, fontSize: 12 }} />
                <input defaultValue="cada 24h" style={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, fontSize: 12 }} />
                <input defaultValue="PO" style={{ borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, fontSize: 12 }} />
              </div>
              <button style={{ marginTop: 6, fontSize: 11, padding: '4px 10px', borderRadius: 999, background: '#f3f4f6', border: 0 }}>+ fármaco</button>

              <h3 style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>COMENTARIOS U OBSERVACIONES</h3>
              <textarea defaultValue="Tutor refiere ansiedad. Control en 48h si persiste vómito." style={{ width: '100%', minHeight: 70, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6, fontSize: 12 }} />

              <h3 style={{ fontSize: 11, fontWeight: 800, marginTop: 16 }}>AGREGAR EVENTOS A LA AGENDA</h3>
              <select style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: 10, marginTop: 6, fontSize: 12 }}>
                <option>Control 7 días</option>
                <option>Vacuna anual - 365 días</option>
                <option>Desparasitación - 90 días</option>
                <option>Cirugía programada - 2 días</option>
                <option>Hospitalización control - 1 día</option>
              </select>
              <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                <input type="date" defaultValue="2025-06-10" style={{ flex: 1, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, fontSize: 12 }} />
                <input type="time" defaultValue="09:00" style={{ width: 110, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8, fontSize: 12 }} />
              </div>
              <button style={{ width: '100%', marginTop: 8, height: 40, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>+ Agregar evento a agenda</button>

              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button style={{ flex: 1, height: 40, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12 }}>Receta PDF</button>
                <button style={{ flex: 1, height: 40, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 12 }}>Orden PDF</button>
              </div>
              <div style={{ fontSize: 10, color: '#6b7280', textAlign: 'center', marginTop: 12 }}>Guardado borrador automático cada 10s • Finalizar mueve EN CONSULTA → ATENDIDA con borrador</div>
            </div>
          </div>
        </div>
      )}
{/* DRAWER COBRAR - BORRADOR EDITABLE */}
      {showCobrar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 60, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 420, background: 'white', height: '100%', overflow: 'auto', padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800 }}>Cobrar — {showCobrar.nombre} - Borrador del médico editable por recepción</div>
              <button onClick={() => setShowCobrar(null)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>

            {showCobrar.borrador?.map((b, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 12, padding: '10px 12px', marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{b.nombre}</div>
                  <div style={{ fontSize: 11, color: '#6b7280' }}>- 1 + Precio</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input defaultValue={b.precio} style={{ width: 70, borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: '4px 8px', fontSize: 12 }} />
                  <button style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>X</button>
                </div>
              </div>
            ))}

            <button style={{ width: '100%', marginTop: 10, height: 40, borderRadius: 12, border: '1px dashed #F59E0B', background: '#FFFBF7', color: '#F59E0B', fontWeight: 700, cursor: 'pointer' }}>+ AGREGAR PRODUCTO/SERVICIO</button>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {SERVICIOS.slice(0, 5).map(s => <button key={s.nombre} style={{ fontSize: 10, padding: '4px 8px', borderRadius: 999, background: '#f3f4f6', border: 0, cursor: 'pointer' }}>{s.nombre} ${s.precio.toLocaleString()}</button>)}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <div style={{ flex: 1 }}><div style={{ fontSize: 10 }}>DESC %</div><input defaultValue="0" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8 }} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 10 }}>DESC $</div><input defaultValue="0" style={{ width: '100%', borderRadius: 8, border: '1px solid rgba(0,0,0,0.1)', padding: 8 }} /></div>
            </div>
            <div style={{ marginTop: 12, fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>${showCobrar.precio?.toLocaleString()}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Descuento</span><span>-$0</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 14, borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: 8, marginTop: 8 }}><span>Total</span><span>${showCobrar.precio?.toLocaleString()}</span></div>
            </div>

            <div style={{ background: '#f9fafb', borderRadius: 12, padding: 10, marginTop: 12, fontSize: 11 }}>
              <div>Boleta SII QR SII Boleta electrónica exenta Folio 4421 SERNAC informa</div>
              <div style={{ marginTop: 6 }}>Upsell acs.mascotas</div>
              <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                <span style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '4px 8px', fontSize: 11 }}>Collar isabelino $8.900</span>
                <span style={{ background: 'white', border: '1px solid rgba(0,0,0,0.08)', borderRadius: 8, padding: '4px 8px', fontSize: 11 }}>Alimento 7kg $24.900</span>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 12, fontSize: 11 }}><input type="checkbox" /> Confirmar corrección para prevenir errores</label>

            <button onClick={() => { setToast('✓ Cobrado y enviado por WA $' + showCobrar.precio?.toLocaleString()); setShowCobrar(null); setTimeout(() => setToast(''), 2000) }} style={{ width: '100%', marginTop: 12, height: 48, borderRadius: 12, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Cobrar y enviar WhatsApp con boleta</button>
          </div>
        </div>
      )}

      {/* MODAL NUEVO CLIENTE - ICONO */}
      {showNuevoCliente && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 70, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: 420, background: 'white', borderRadius: 16, padding: 20, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800 }}>Nuevo cliente - Paso {pasoCliente}/2</div>
              <button onClick={() => setShowNuevoCliente(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer' }}>✕</button>
            </div>
            {pasoCliente === 1 ? (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={nuevoTutor.nombre} onChange={e => setNuevoTutor({ ...nuevoTutor, nombre: e.target.value })} placeholder="Nombre completo" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                <input value={nuevoTutor.rut} onChange={e => setNuevoTutor({ ...nuevoTutor, rut: e.target.value })} placeholder="RUT 11.111.111-1" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                <input value={nuevoTutor.tel} onChange={e => setNuevoTutor({ ...nuevoTutor, tel: e.target.value })} placeholder="Tel +569" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                <input value={nuevoTutor.email} onChange={e => setNuevoTutor({ ...nuevoTutor, email: e.target.value })} placeholder="Email" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                <input value={nuevoTutor.dir} onChange={e => setNuevoTutor({ ...nuevoTutor, dir: e.target.value })} placeholder="Dirección" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                <button onClick={() => setPasoCliente(2)} style={{ height: 44, borderRadius: 12, background: '#0F172A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Siguiente → Datos mascota</button>
              </div>
            ) : (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input value={nuevaMascota.nombre} onChange={e => setNuevaMascota({ ...nuevaMascota, nombre: e.target.value })} placeholder="Nombre Milo" style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                <div style={{ display: 'flex', gap: 8 }}>
                  <select value={nuevaMascota.especie} onChange={e => setNuevaMascota({ ...nuevaMascota, especie: e.target.value })} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}>
                    <option value="canino">Canino</option><option value="felino">Felino</option><option value="ave">Ave</option><option value="exótico">Exótico</option>
                  </select>
                  <select value={nuevaMascota.raza} onChange={e => setNuevaMascota({ ...nuevaMascota, raza: e.target.value })} style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}>
                    <option>Beagle</option><option>Labrador</option><option>Mestizo</option><option>Siamés</option><option>Persa</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={nuevaMascota.peso} onChange={e => setNuevaMascota({ ...nuevaMascota, peso: e.target.value })} placeholder="Peso kg 22" style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                  <input value={nuevaMascota.microchip} onChange={e => setNuevaMascota({ ...nuevaMascota, microchip: e.target.value })} placeholder="Microchip 15 dígitos" style={{ flex: 1, height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 12px' }} />
                </div>
                <select value={nuevaMascota.esterilizado} onChange={e => setNuevaMascota({ ...nuevaMascota, esterilizado: e.target.value })} style={{ height: 40, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}>
                  <option>Sí</option><option>No</option><option>No sabe</option>
                </select>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setPasoCliente(1)} style={{ flex: 1, height: 44, borderRadius: 12, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontWeight: 700, cursor: 'pointer' }}>Volver</button>
                  <button onClick={() => {
                    const nuevo: Paciente = { id: Date.now().toString(), nombre: nuevaMascota.nombre || 'Milo', especie: nuevaMascota.especie, raza: nuevaMascota.raza, peso: parseFloat(nuevaMascota.peso) || 10, microchip: nuevaMascota.microchip, esterilizado: nuevaMascota.esterilizado, tutor: { nombre: nuevoTutor.nombre || 'Bastián G.', rut: nuevoTutor.rut || '11.111.111-1', tel: nuevoTutor.tel || '+56912345678' }, motivo: 'Nuevo cliente', hora: new Date().toLocaleTimeString().slice(0,5), estado: 'agendada', tipo: 'agendado', precio: 50000 }
                    setPacientes(p => [...p, nuevo])
                    setShowNuevoCliente(false)
                    setPasoCliente(1)
                    setNuevoTutor({ nombre: '', rut: '', tel: '', email: '', dir: '' })
                    setNuevaMascota({ nombre: '', especie: 'canino', raza: 'Beagle', peso: '', microchip: '', esterilizado: 'Sí', nacimiento: '', color: '' })
                    setToast('✓ Tutor + paciente creado')
                    setTimeout(() => setToast(''), 2000)
                  }} style={{ flex: 1, height: 44, borderRadius: 12, background: '#16A34A', color: 'white', border: 0, fontWeight: 700, cursor: 'pointer' }}>Crear tutor + paciente + agenda</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#0F172A', color: 'white', padding: '10px 20px', borderRadius: 999, fontSize: 13, zIndex: 100 }}>{toast}</div>}
    </div>
  )
}
          
