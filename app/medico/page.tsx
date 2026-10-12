'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import Link from 'next/link';

export default function MedicoPage() {
  const [citas, setCitas] = useState<any[]>([]);

  async function cargar() {
    const { data } = await supabase
      .from('agenda')
      .select('*, pacientes(id,nombre), tutores(nombre_completo)')
      .in('estado', ['en_espera', 'en_atencion'])
      .order('fecha_hora', { ascending: true });
    setCitas(data || []);
  }

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'system-ui', background: '#f8fafc', minHeight: '100vh' }}>
      <h1 style={{ fontWeight: 800, fontSize: 20 }}>Vista Médico</h1>
      {citas.length === 0 && <div style={{ marginTop: 20, padding: 20, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', textAlign: 'center', color: '#6b7280' }}>Sin pacientes en sala</div>}
      {citas.map((c: any) => (
        <div key={c.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderLeft: '5px solid #2563eb', borderRadius: 12, padding: 12, marginTop: 10 }}>
          <div style={{ fontWeight: 700 }}>{c.pacientes?.nombre}</div>
          <div style={{ fontSize: 12 }}>{c.tutores?.nombre_completo}</div>
          <Link href={`/pacientes/${c.paciente_id}`} style={{ display: 'block', marginTop: 8, background: '#111827', color: 'white', textAlign: 'center', padding: 10, borderRadius: 999, textDecoration: 'none' }}>Abrir ficha</Link>
        </div>
      ))}
    </div>
  );
}
