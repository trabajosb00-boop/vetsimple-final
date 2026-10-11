'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const estados: any = {
  agendada: { label: 'Check-in', color: '#111827', next: 'en_espera' },
  en_espera: { label: 'En espera', color: '#ef4444', next: 'en_atencion' },
  en_atencion: { label: 'En atención', color: '#2563eb', next: 'atendida' },
  en_sala: { label: 'En atención', color: '#2563eb', next: 'atendida' },
  atendida: { label: 'Atendido ✓', color: '#16a34a', next: null },
};

export default function HoyPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    const { count } = await supabase.from('agenda').select('*', { count: 'exact', head: true });
    setTotal(count || 0);
    const { data } = await supabase.from('agenda').select('*, pacientes(nombre, especie), tutores(nombre_completo)').order('fecha_hora');
    setCitas(data || []);
    setLoading(false);
  }
  useEffect(() => { cargar(); }, []);

  async function avanzar(cita: any) {
    const cfg = estados[cita.estado];
    if (!cfg || !cfg.next) return;
    await supabase.from('agenda').update({ estado: cfg.next }).eq('id', cita.id);
    cargar();
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hoy - Recepción</h1>
      <div style={{ background: 'white', padding: 12, borderRadius: 12, marginBottom: 16, border: '1px solid #e5e7eb' }}>Total en BD: {total} | Mostrando: {citas.length}</div>
      {loading ? <p>Cargando...</p> : citas.map((c: any) => {
        const cfg = estados[c.estado] || estados.agendada;
        return (
          <div key={c.id} style={{ background: 'white', padding: 16, borderRadius: 16, border: `2px solid ${c.estado !== 'agendada' ? cfg.color : '#e5e7eb'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div><div style={{ fontWeight: 800 }}>{c.pacientes?.nombre} - {c.pacientes?.especie}</div><div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo} | {c.estado}</div></div>
            <button onClick={() => avanzar(c)} disabled={!cfg.next} style={{ background: cfg.color, color: 'white', padding: '10px 16px', borderRadius: 999, border: 0, fontWeight: 800, opacity: cfg.next ? 1 : 0.9 }}>{cfg.label}</button>
          </div>
        );
      })}
    </div>
  );
}
