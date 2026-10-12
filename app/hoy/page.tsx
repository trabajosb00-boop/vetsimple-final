'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';

const COLORES: any = {
  ingresado: { label: 'Ingresado', color: '#f59e0b', bg: '#fef3c7' },
  en_espera: { label: 'En espera', color: '#dc2626', bg: '#fee2e2' },
  en_atencion: { label: 'En atención', color: '#2563eb', bg: '#dbeafe' },
  atendida: { label: 'Atendido', color: '#16a34a', bg: '#dcfce7' },
  agendado: { label: 'Agendado', color: '#6b7280', bg: '#f3f4f6' },
};

export default function Sala() {
  const [citas, setCitas] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [result, setResult] = useState<any[]>([]);
  const [vets, setVets] = useState<any[]>([]);
  const router = useRouter();

  async function cargar() {
    const { data } = await supabase.from('agenda').select('*, pacientes(id, nombre, especie), tutores(nombre_completo), veterinarios(nombre_completo)').order('fecha_hora', { ascending: false }).limit(30);
    setCitas((data || []).filter(c => c.estado!== 'atendida' && c.estado!== 'cancelada'));
    const { data: v } = await supabase.from('veterinarios').select('*'); setVets(v || []);
  }
  useEffect(() => { cargar(); }, []);

  async function buscar(texto: string) {
    setQ(texto);
    if (texto.length < 2) { setResult([]); return; }
    const { data } = await supabase.from('pacientes').select('*, tutores(nombre_completo)').ilike('nombre', `%${texto}%`).limit(5);
    setResult(data || []);
  }

  async function agregar(p: any) {
    const resena = prompt(`¿Por qué viene ${p.nombre}? Ej: Vómitos desde ayer, decaído, no come`);
    if (!resena) return;
    await supabase.from('agenda').insert({
      paciente_id: p.id, tutor_id: p.tutor_id, veterinario_id: vets[0]?.id,
      motivo_consulta: 'Consulta', resena: resena, tipo_ingreso: 'ingresado', estado: 'en_espera', fecha_hora: new Date().toISOString()
    });
    setQ(''); setResult([]); cargar();
  }

  async function cambiar(id: string, nuevo: string) {
    await supabase.from('agenda').update({ estado: nuevo }).eq('id', id); cargar();
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <h1 style={{ fontWeight: 800, fontSize: 20 }}>Sala de Espera</h1>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 10, marginTop: 12 }}>
        <input value={q} onChange={e => buscar(e.target.value)} placeholder="🔍 Buscar paciente para ingresar a sala..." style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        {result.map(p => (
          <div key={p.id} onClick={() => agregar(p)} style={{ padding: 12, borderBottom: '1px solid #f3f4f6', cursor: 'pointer' }}>
            <b>{p.nombre}</b> - {p.tutores?.nombre_completo} → <span style={{ color: '#2563eb' }}>Ingresar a sala</span>
          </div>
        ))}
        <Link href="/pacientes/nuevo" style={{ display: 'block', marginTop: 8, background: '#111827', color: 'white', textAlign: 'center', padding: 10, borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>+ Nuevo paciente/tutor</Link>
      </div>

      {citas.map(c => {
        const cfg = COLORES[c.estado] || COLORES.ingresado;
        return (
          <div key={c.id} style={{ background: cfg.bg, borderLeft: `6px solid ${cfg.color}`, border: '1px solid #e5e7eb', borderRadius: 14, padding: 12, marginTop: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{c.pacientes?.nombre} - {c.pacientes?.especie}</div>
                <div style={{ fontSize: 11, color: '#4b5563' }}>Tutor: {c.tutores?.nombre_completo}</div>
                {/* RESEÑA REAL, NO "CONSULTA" */}
                <div style={{ fontSize: 12, marginTop: 6, background: 'white', padding: '6px 8px', borderRadius: 8, border: '1px solid #e5e7eb' }}>
                  <b>Motivo:</b> {c.resena || c.motivo_consulta || 'Sin reseña'}
                </div>
                <div style={{ fontSize: 11, marginTop: 6 }}>🩺 {c.veterinarios?.nombre_completo || 'Sin médico'} • {cfg.label}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {c.estado === 'en_espera' && <button onClick={() => { cambiar(c.id, 'en_atencion'); router.push(`/pacientes/${c.paciente_id}`); }} style={{ background: cfg.color, color: 'white', border: 0, padding: '8px 12px', borderRadius: 999, fontWeight: 700 }}>▶ Atender</button>}
                {c.estado === 'ingresado' && <button onClick={() => cambiar(c.id, 'en_espera')} style={{ background: cfg.color, color: 'white', border: 0, padding: '8px 12px', borderRadius: 999 }}>→ Espera</button>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <Link href={`/pacientes/${c.paciente_id}`} style={{ flex: 1, background: 'white', border: '1px solid #e5e7eb', padding: '10px', borderRadius: 999, fontSize: 12, textAlign: 'center', textDecoration: 'none', fontWeight: 700, color: 'black' }}>📋 Ficha</Link>
              <button onClick={() => router.push(`/ventas/${c.id}`)} style={{ flex: 1, background: 'white', border: '1px solid #e5e7eb', padding: '10px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>💲 Cobrar</button>
              <button onClick={() => router.push(`/chat/${c.id}`)} style={{ flex: 1, background: 'white', border: '1px solid #e5e7eb', padding: '10px', borderRadius: 999, fontSize: 12 }}>💬 Médico</button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
