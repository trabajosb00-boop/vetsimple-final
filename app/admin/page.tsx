'use client'
import { useState } from 'react'

type Servicio = { id: string; nombre: string; precio: number; categoria: string }
type Usuario = { id: string; nombre: string; rol: string; tel: string; email: string; whatsapp: string; presente: boolean }

const SERVICIOS_MOCK: Servicio[] = [
  { id: '1', nombre: 'Consulta general', precio: 35000, categoria: 'Consulta' },
  { id: '2', nombre: 'Vacuna óctuple', precio: 15000, categoria: 'Vacuna' },
  { id: '3', nombre: 'Desparasitación', precio: 8000, categoria: 'Preventivo' },
  { id: '4', nombre: 'Perfil bioquímico', precio: 18000, categoria: 'Lab' },
]

const USUARIOS_MOCK: Usuario[] = [
  { id: '1', nombre: 'Dra. María', rol: 'Veterinario', tel: '+56912345678', email: 'maria@vet.cl', whatsapp: '+56912345678', presente: true },
  { id: '2', nombre: 'Técnico Juan', rol: 'Técnico', tel: '+56987654321', email: 'juan@vet.cl', whatsapp: '+56987654321', presente: true },
  { id: '3', nombre: 'Recepción Ana', rol: 'Recepción', tel: '+56911223344', email: 'ana@vet.cl', whatsapp: '+56911223344', presente: true },
  { id: '4', nombre: 'Dr. Pedro', rol: 'Veterinario', tel: '+56955667788', email: 'pedro@vet.cl', whatsapp: '+56955667788', presente: false },
]

export default function AdminPage() {
  const [tab, setTab] = useState<'Servicios' | 'Usuarios' | 'Métricas' | 'Stock' | 'Facturas' | 'Formularios Órdenes' | 'Etiquetas' | 'Eventos Agenda' | 'Exámenes'>('Servicios')
  const [servicios, setServicios] = useState<Servicio[]>(SERVICIOS_MOCK)
  const [usuarios, setUsuarios] = useState<Usuario[]>(USUARIOS_MOCK)
  const [nuevoServicio, setNuevoServicio] = useState({ nombre: '', precio: '', categoria: 'Consulta' })
  const [nuevoUsuario, setNuevoUsuario] = useState({ nombre: '', rol: 'Veterinario', tel: '', email: '', whatsapp: '' })

  function handleImportExcel(tipo: string) {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls,.csv'
    input.onchange = (e: any) => {
      const file = e.target.files[0]
      if (file) alert(`✓ Importando ${tipo} desde ${file.name}\nFormato predefinido: nombre, precio, categoria\nEn producción: parsear con SheetJS y guardar en Supabase`)
    }
    input.click()
  }

  return (
    <div style={{ minHeight: '100vh', background: '#FFFBF7', fontFamily: 'Inter, sans-serif', padding: 16 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap');`}</style>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 20 }}>Admin VetSimple</div>
            <div style={{ fontSize: 12, color: '#6b7280' }}>Fuera del flujo de trabajo · Solo admin</div>
          </div>
          <button onClick={() => window.location.href = '/hoy'} style={{ padding: '8px 16px', borderRadius: 999, background: '#0F172A', color: 'white', border: 0, cursor: 'pointer' }}>Volver al kanban</button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
          {(['Servicios', 'Usuarios', 'Métricas', 'Stock', 'Facturas', 'Formularios Órdenes', 'Etiquetas', 'Eventos Agenda', 'Exámenes'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 14px', borderRadius: 999, background: tab === t ? '#0F172A' : 'white', color: tab === t ? 'white' : '#0F172A', border: '1px solid rgba(0,0,0,0.08)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{t}</button>
          ))}
        </div>

        {tab === 'Servicios' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800 }}>Servicios</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => handleImportExcel('servicios')} style={{ padding: '8px 12px', borderRadius: 999, background: '#FEF3C7', border: '1px solid #F59E0B', fontSize: 11, cursor: 'pointer' }}>📥 Importar Excel/Sheets</button>
                <button onClick={() => { const blob = new Blob(['nombre,precio,categoria\nConsulta general,35000,Consulta\nVacuna óctuple,15000,Vacuna'], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'plantilla_servicios.csv'; a.click() }} style={{ padding: '8px 12px', borderRadius: 999, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11, cursor: 'pointer' }}>📄 Descargar plantilla .xlsx</button>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
              <input value={nuevoServicio.nombre} onChange={e => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })} placeholder="Nombre servicio" style={{ flex: 1, minWidth: 140, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
              <input value={nuevoServicio.precio} onChange={e => setNuevoServicio({ ...nuevoServicio, precio: e.target.value })} placeholder="Precio" style={{ width: 100, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
              <select value={nuevoServicio.categoria} onChange={e => setNuevoServicio({ ...nuevoServicio, categoria: e.target.value })} style={{ width: 120, height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}>
                <option>Consulta</option><option>Vacuna</option><option>Lab</option><option>Imagen</option><option>Producto</option><option>Preventivo</option>
              </select>
              <button onClick={() => { if (!nuevoServicio.nombre) return; setServicios(s => [...s, { id: Date.now().toString(), nombre: nuevoServicio.nombre, precio: parseInt(nuevoServicio.precio) || 0, categoria: nuevoServicio.categoria }]); setNuevoServicio({ nombre: '', precio: '', categoria: 'Consulta' }) }} style={{ padding: '0 16px', height: 36, borderRadius: 10, background: '#0F172A', color: 'white', border: 0, cursor: 'pointer' }}>+ Nuevo servicio</button>
            </div>
            <div style={{ fontSize: 10, color: '#6b7280', marginBottom: 10 }}>Formato predefinido Excel: columnas nombre, precio, categoria. Ejemplo: Consulta general, 35000, Consulta. Compatible con Sheets export .xlsx</div>
            <table style={{ width: '100%', fontSize: 12 }}>
              <thead><tr style={{ textAlign: 'left', color: '#6b7280' }}><th>NOMBRE</th><th>PRECIO</th><th>CATEGORÍA</th><th>ACCIONES</th></tr></thead>
              <tbody>
                {servicios.map(s => (
                  <tr key={s.id} style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                    <td style={{ padding: '8px 0' }}>{s.nombre}</td><td>${s.precio.toLocaleString()}</td><td>{s.categoria}</td>
                    <td><button style={{ fontSize: 11, background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>Editar</button> <button onClick={() => setServicios(serv => serv.filter(x => x.id !== s.id))} style={{ fontSize: 11, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>Eliminar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'Usuarios' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 800 }}>Usuarios · con WhatsApp · solo presentes chatean</div>
              <button onClick={() => handleImportExcel('usuarios')} style={{ padding: '8px 12px', borderRadius: 999, background: '#FEF3C7', border: '1px solid #F59E0B', fontSize: 11, cursor: 'pointer' }}>📥 Importar Excel</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8, marginBottom: 12 }}>
              <input value={nuevoUsuario.nombre} onChange={e => setNuevoUsuario({ ...nuevoUsuario, nombre: e.target.value })} placeholder="Nombre" style={{ height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
              <select value={nuevoUsuario.rol} onChange={e => setNuevoUsuario({ ...nuevoUsuario, rol: e.target.value })} style={{ height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 8px' }}><option>Veterinario</option><option>Técnico</option><option>Recepción</option><option>Admin</option></select>
              <input value={nuevoUsuario.whatsapp} onChange={e => setNuevoUsuario({ ...nuevoUsuario, whatsapp: e.target.value })} placeholder="WhatsApp +569" style={{ height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
              <input value={nuevoUsuario.email} onChange={e => setNuevoUsuario({ ...nuevoUsuario, email: e.target.value })} placeholder="Email" style={{ height: 36, borderRadius: 10, border: '1px solid rgba(0,0,0,0.1)', padding: '0 10px' }} />
              <button onClick={() => { if (!nuevoUsuario.nombre) return; setUsuarios(u => [...u, { id: Date.now().toString(), nombre: nuevoUsuario.nombre, rol: nuevoUsuario.rol, tel: nuevoUsuario.whatsapp, email: nuevoUsuario.email, whatsapp: nuevoUsuario.whatsapp, presente: true }]); setNuevoUsuario({ nombre: '', rol: 'Veterinario', tel: '', email: '', whatsapp: '' }) }} style={{ height: 36, borderRadius: 10, background: '#0F172A', color: 'white', border: 0, cursor: 'pointer' }}>+ Crear usuario</button>
            </div>
            <div style={{ display: 'grid', gap: 8 }}>
              {usuarios.map(u => (
                <div key={u.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: 10, background: u.presente ? '#f0fdf4' : 'white' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{u.nombre} · {u.rol} {u.presente ? '🟢 Presente' : '⚪ Ausente'}</div>
                    <div style={{ fontSize: 11, color: '#6b7280' }}>{u.whatsapp} · {u.email} · WhatsApp habilitado</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => window.open(`https://wa.me/${u.whatsapp.replace(/[^0-9]/g, '')}`, '_blank')} style={{ padding: '4px 10px', borderRadius: 999, background: '#25D366', color: 'white', border: 0, fontSize: 11, cursor: 'pointer' }}>WhatsApp</button>
                    <button onClick={() => setUsuarios(us => us.map(x => x.id === u.id ? { ...x, presente: !x.presente } : x))} style={{ padding: '4px 10px', borderRadius: 999, background: 'white', border: '1px solid rgba(0,0,0,0.1)', fontSize: 11, cursor: 'pointer' }}>{u.presente ? 'Marcar ausente' : 'Marcar presente'}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Métricas' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 12 }}>Métricas hoy</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ background: '#DBEAFE', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: '#6b7280' }}>$ por cobrar</div><div style={{ fontSize: 22, fontWeight: 800 }}>$540.000</div></div>
              <div style={{ background: '#FEF3C7', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: '#6b7280' }}>No-shows</div><div style={{ fontSize: 22, fontWeight: 800 }}>2</div></div>
              <div style={{ background: '#D1FAE5', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: '#6b7280' }}>Sin hora</div><div style={{ fontSize: 22, fontWeight: 800 }}>3</div></div>
              <div style={{ background: '#E9D5FF', borderRadius: 12, padding: 16 }}><div style={{ fontSize: 11, color: '#6b7280' }}>Ticket promedio</div><div style={{ fontSize: 22, fontWeight: 800 }}>$32.500</div></div>
            </div>
          </div>
        )}

        {(tab === 'Stock' || tab === 'Facturas' || tab === 'Formularios Órdenes') && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800 }}>{tab}</div>
              <button onClick={() => handleImportExcel(tab.toLowerCase())} style={{ padding: '8px 12px', borderRadius: 999, background: '#FEF3C7', border: '1px solid #F59E0B', fontSize: 11, cursor: 'pointer' }}>📥 Importar Excel/Sheets</button>
            </div>
            <div style={{ marginTop: 12, fontSize: 12, color: '#6b7280' }}>Crea desde sistema o importa desde Excel/Sheets con formato predefinido. Plantilla: nombre, precio, stock / folio, monto, fecha.</div>
            <div style={{ marginTop: 12, background: '#f9fafb', borderRadius: 10, padding: 20, textAlign: 'center', fontSize: 12, color: '#9ca3af' }}>Tabla {tab} + Importar + Crear</div>
          </div>
        )}

        {tab === 'Eventos Agenda' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800 }}>Eventos de agenda predefinidos (modificables por admin o usuario con permiso)</div>
              <button onClick={() => handleImportExcel('eventos_agenda')} style={{ padding: '6px 12px', borderRadius: 999, background: '#FEF3C7', border: '1px solid #F59E0B', fontSize: 11, cursor: 'pointer' }}>📥 Importar Excel</button>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { nombre: 'Control 7 días', dias: 7, color: '#DBEAFE' },
                { nombre: 'Vacuna anual', dias: 365, color: '#D1FAE5' },
                { nombre: 'Desparasitación', dias: 90, color: '#FEF3C7' },
                { nombre: 'Cirugía programada', dias: 2, color: '#FECACA' },
                { nombre: 'Hospitalización control', dias: 1, color: '#E9D5FF' },
              ].map(ev => (
                <div key={ev.nombre} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', borderRadius: 10, background: ev.color }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{ev.nombre} - {ev.dias} días</span>
                  <span style={{ fontSize: 11 }}><button style={{ background: 'white', border: '1px solid rgba(0,0,0,0.1)', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>Editar</button> <button style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>Eliminar</button></span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Exámenes' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 800 }}>Exámenes diagnósticos predefinidos (modificables por admin o usuario con permiso)</div>
              <button onClick={() => handleImportExcel('examenes')} style={{ padding: '6px 12px', borderRadius: 999, background: '#FEF3C7', border: '1px solid #F59E0B', fontSize: 11, cursor: 'pointer' }}>📥 Importar Excel</button>
            </div>
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { nombre: 'Hemograma completo', precio: 12000, cat: 'Hematología' },
                { nombre: 'Perfil bioquímico 12 paráms', precio: 18000, cat: 'Bioquímica' },
                { nombre: 'Rx tórax 2 proyecciones', precio: 25000, cat: 'Imagen' },
                { nombre: 'Eco abdominal completa', precio: 35000, cat: 'Imagen' },
              ].map(ex => (
                <div key={ex.nombre} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 10, background: '#f9fafb', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <span style={{ fontSize: 12 }}>{ex.nombre} - {ex.cat}</span><span style={{ fontSize: 12 }}>${ex.precio.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'Etiquetas' && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16 }}>
            <div style={{ fontWeight: 800 }}>Etiquetas clientes y mascotas con color</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              {[
                { n: 'Crónico', c: '#EF4444' }, { n: 'Cachorro', c: '#06B6D4' }, { n: 'Alérgica', c: '#F59E0B' }, { n: 'Agresivo', c: '#DC2626' }, { n: 'Geriátrico', c: '#8B5CF6' }, { n: 'VIP', c: '#10B981' }, { n: 'Nuevo', c: '#3B82F6' },
              ].map(et => <span key={et.n} style={{ background: et.c, color: 'white', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>{et.n}</span>)}
            </div>
            <div style={{ marginTop: 12 }}><button style={{ padding: '8px 14px', borderRadius: 999, background: '#0F172A', color: 'white', border: 0, cursor: 'pointer' }}>+ Nueva etiqueta con color picker</button></div>
          </div>
        )}
      </div>
    </div>
  )
}
