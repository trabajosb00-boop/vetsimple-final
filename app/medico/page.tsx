'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';

export default function Medico() {
  const [citas, setCitas] = useState<any[]>([]);

  async function cargar() {
    const { data } = await supabase
      .from('agenda')
      .select('*, pacientes(id,nombre,especie), tutores(nombre_completo)')
      .in('estado', ['en_espera', 'en_atencion'])
      .order('fecha_hora', { ascending: true });
    setCitas(data || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  async function atender(c: any) {
    await supabase.from('agenda').update({ estado: 'en_atencion' }).eq('id', c.id);
    window.location.href = `/pacientes/${c.paciente_id}`;
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'system-ui', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 800, fontSize: 20 }}>Vista Médico</h1>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>Mis pacientes en sala - solo en espera / en atención</div>

      {citas.length === 0 && <div style={{ marginTop: 20, background: 'white', border: '1px solid #e5e7eb', borderRadius: 12, padding: 20, textAlign: 'center', color: '#6b7280' }}>No hay pacientes en sala</div>}

      {citas.map(c => (
        <div key={c.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderLeft: '5px solid #2563eb', borderRadius: 12, padding: 12, marginTop: 10 }}>
          <div style={{ fontWeight: 800 }}>{c.pacientes?.nombre} - {c.pacientes?.especie}</div>
          <div style={{ fontSize: 12, color: '#4b5563' }}>Tutor: {c.tutores?.nombre_completo}</div>
          <div style={{ fontSize: 12, marginTop: 6, background: '#f9fafb', padding: '6px 8px', borderRadius: 8 }}>{c.resena || c.motivo_consulta || 'Sin motivo'}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button onClick={() => atender(c)} style={{ flex: 1, background: '#111827', color: 'white', border: 0, padding: 10, borderRadius: 999, fontWeight: 700 }}>Abrir ficha y atender</button>
            <Link href={`/pacientes/${c.paciente_id}`} style={{ flex: 1, background: 'white', border: '1px solid #e5e7eb', padding: 10, borderRadius: 999, textAlign: 'center', textDecoration: 'none', color: 'black', fontSize: 12, fontWeight: 700 }}>Ficha</Link>
          </div>
        </div>
      ))}
    </div>
  );
}
