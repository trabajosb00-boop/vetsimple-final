'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

const ESTADOS: any = {
  recepcion: { label: 'Recepción', color: '#111827', next: 'en_espera' },
  agendada: { label: 'Recepción', color: '#111827', next: 'en_espera' },
  en_espera: { label: 'En espera', color: '#ef4444', next: 'en_atencion' },
  en_atencion: { label: 'En atención', color: '#2563eb', next: 'atendida' },
  atendida: { label: 'Atendido', color: '#16a34a', next: null },
  cancelada: { label: 'Cancelada', color: '#6b7280', next: null },
};

export default function SalaEspera() {
  const [citas, setCitas] = useState<any[]>([]);
  const [filtro, setFiltro] = useState('');
  const [pacientes, setPacientes] = useState<any[]>([]);

  async function cargar() {
    const { data } = await supabase.from('agenda').select('*, pacientes(nombre, especie), tutores(nombre_completo), veterinarios(nombre_completo)').order('fecha_hora', { ascending: true });
    setCitas(data || []);
    const { data: p } = await supabase.from('pacientes').select('*, tutores(nombre_completo)').limit(20);
    setPacientes(p || []);
  }
  useEffect(() => { cargar(); }, []);

  const filtradas = citas.filter(c =>
    (c.pacientes?.nombre?.toLowerCase().includes(filtro.toLowerCase()) ||
     c.tutores?.nombre_completo?.toLowerCase().includes(filtro.toLowerCase())) &&
    c.estado!== 'cancelada'
  );

  async function cambiar(id: string, nuevo: string) {
    await supabase.from('agenda').update({ estado: nuevo }).eq('id', id);
    cargar();
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800 }}>Sala de Espera</h1>

      {/* BUSCADOR QUE PEDISTE */}
      <div style={{ background: 'white', padding: 12, borderRadius: 14, border: '1px solid #e5e7eb', marginTop: 12, display: 'flex', gap: 8 }}>
        <input value={filtro} onChange={e => setFiltro(e.target.value)} placeholder="🔍 Buscar paciente o tutor para agregar a sala..." style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        <Link href="/pacientes/nuevo" style={{ background: '#111827', color: 'white', padding: '12px 16px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>+ Nuevo</Link>
      </div>

      <div style={{ marginTop: 16 }}>
        {filtradas.map(c => {
          const cfg = ESTADOS[c.estado] || ESTADOS.recepcion;
          return (
            <div key={c.id} style={{ background: 'white', borderLeft: `6px solid ${cfg.color}`, padding: 14, borderRadius: 14, border: '1px solid #e5e7eb', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Link href={`/pacientes/${c.paciente_id}`} style={{ fontWeight: 800, color: 'black', fontSize: 16 }}>{c.pacientes?.nombre} - {c.pacientes?.especie}</Link>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Tutor: {c.tutores?.nombre_completo} • {c.motivo_consulta || c.tipo_cita || 'Sin motivo'}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>🩺 {c.veterinarios?.nombre_completo || 'Sin médico'} • {cfg.label}</div>
                </div>
                {cfg.next && <button onClick={() => cambiar(c.id, cfg.next)} style={{ background: cfg.color, color: 'white', padding: '10px 14px', borderRadius: 999, border: 0, fontWeight: 700, height: 40 }}>{cfg.label}</button>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <Link href={`/pacientes/${c.paciente_id}?medico=${c.veterinario_id}`} style={{ background: '#eff6ff', border: '1px solid #dbeafe', padding: '8px 12px', borderRadius: 999, fontSize: 12, textDecoration: 'none', fontWeight: 700 }}>📋 Ficha</Link>
                <Link href={`/ventas/${c.id}`} style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 12px', borderRadius: 999, fontSize: 12, textDecoration: 'none', fontWeight: 700 }}>💲 Cobrar</Link>
                <Link href={`/chat/${c.id}`} style={{ background: '#faf5ff', border: '1px solid #e9d5ff', padding: '8px 12px', borderRadius: 999, fontSize: 12, textDecoration: 'none' }}>💬 Médico</Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
