'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';

export default function HoyPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  async function cargar() {
    setLoading(true);
    setErrorMsg('');
    const { data: totalData } = await supabase.from('agenda').select('id', { count: 'exact' });
    if (totalData) setTotal(totalData.length);
    
    const { data, error } = await supabase
      .from('agenda')
      .select('*, pacientes(nombre, especie), tutores(nombre_completo), veterinarios(nombre_completo)')
      .order('fecha_hora', { ascending: true });

    if (error) { setErrorMsg(error.message); setLoading(false); return; }
    setCitas(data || []);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  async function checkin(id: string) {
  const { error } = await supabase.from('agenda').update({ estado: 'en_espera' }).eq('id', id);
  if (error) {
    alert('Error Supabase: ' + error.message);
    console.log(error);
  }
  cargar();
}

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 20 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hoy - Recepción</h1>
      <div style={{ background: 'white', padding: 12, borderRadius: 12, marginBottom: 16, border: '1px solid #e5e7eb' }}>
        <div style={{ fontSize: 14, color: '#6b7280' }}>Total en BD: {total} | Mostrando: {citas.length}</div>
        {errorMsg && <div style={{ color: 'red', marginTop: 8, fontSize: 13 }}>Error Supabase: {errorMsg}. Revisa Environment Variables en Vercel.</div>}
      </div>

      {loading ? <p>Cargando...</p> : citas.length === 0 ? (
        <div style={{ background: 'white', padding: 24, borderRadius: 16, textAlign: 'center' }}>
          <p style={{ fontWeight: 700 }}>No hay citas para hoy</p>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Si acabas de crear el repo, ejecuta el SQL de abajo en Supabase y dale a Actualizar.</p>
          <button onClick={cargar} style={{ marginTop: 12, background: 'black', color: 'white', padding: '10px 18px', borderRadius: 999, border: 0 }}>Actualizar</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {citas.map((c: any) => (
            <div key={c.id} style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>{c.pacientes?.nombre || 'Mascota'} - {c.pacientes?.especie}</div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo} | {c.tipo_cita} | {c.estado}</div>
              </div>
              <button onClick={() => checkin(c.id)} style={{ background: 'black', color: 'white', padding: '10px 16px', borderRadius: 999, border: 0, fontWeight: 700 }}>Check-in</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
