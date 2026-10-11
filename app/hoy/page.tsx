'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function HoyPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    const { count } = await supabase.from('agenda').select('*', { count: 'exact', head: true });
    setTotal(count || 0);
    
    const { data } = await supabase
      .from('agenda')
      .select('*, pacientes(nombre, especie), tutores(nombre_completo)')
      .order('fecha_hora', { ascending: true });
    setCitas(data || []);
    setLoading(false);
  }
  useEffect(() => { cargar(); }, []);

  async function checkin(id: string) {
    await supabase.from('agenda').update({ estado: 'en_espera' }).eq('id', id);
    cargar();
  }
  async function atender(id: string) {
    await supabase.from('agenda').update({ estado: 'atendida' }).eq('id', id);
    cargar();
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hoy - Recepción</h1>
      <div style={{ background: 'white', padding: 12, borderRadius: 12, marginBottom: 16, border: '1px solid #e5e7eb' }}>
        Total en BD: {total} | Mostrando: {citas.length}
      </div>
      {loading ? <p>Cargando...</p> : citas.map((c: any) => (
        <div key={c.id} style={{ background: c.estado === 'en_espera' ? '#fef3c7' : 'white', padding: 16, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <div style={{ fontWeight: 800 }}>{c.pacientes?.nombre} - {c.pacientes?.especie}</div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo} | {c.estado}</div>
          </div>
          {c.estado === 'agendada' && <button onClick={() => checkin(c.id)} style={{ background: 'black', color: 'white', padding: '10px 16px', borderRadius: 999, border: 0, fontWeight: 700 }}>Check-in</button>}
          {c.estado === 'en_espera' && <button onClick={() => atender(c.id)} style={{ background: '#f59e0b', color: 'black', padding: '10px 16px', borderRadius: 999, border: 0, fontWeight: 700 }}>En espera - Atender</button>}
          {c.estado === 'atendida' && <span style={{ background: '#dcfce7', padding: '8px 12px', borderRadius: 999, fontSize: 13, fontWeight: 700 }}>Atendida ✓</span>}
        </div>
      ))}
      <button onClick={cargar} style={{ marginTop: 20, width: '100%', background: 'white', border: '1px solid #e5e7eb', padding: 12, borderRadius: 12 }}>Actualizar</button>
    </div>
  );
}
