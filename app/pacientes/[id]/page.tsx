'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function FichaSimple() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [pac, setPac] = useState<any>(null);
  const [fichas, setFichas] = useState<any[]>([]);
  const [form, setForm] = useState({ motivo:'', peso:'', temp:'', diagnostico:'', tratamiento:'' });

  async function cargar() {
    const { data: p } = await supabase.from('pacientes').select('*, tutores(*)').eq('id', id).single();
    setPac(p);
    const { data: f } = await supabase.from('fichas_clinicas').select('*').eq('paciente_id', id).order('fecha', { ascending: false });
    setFichas(f || []);
  }
  useEffect(() => { cargar(); }, []);

  async function guardar() {
    if (!form.motivo.trim()) return alert('Motivo obligatorio');
    await supabase.from('fichas_clinicas').insert({
      paciente_id: id,
      motivo: form.motivo,
      diagnostico: form.diagnostico,
      tratamiento: form.tratamiento,
      peso: form.peso ? Number(form.peso) : null,
      temp: form.temp ? Number(form.temp) : null,
    });
    setForm({ motivo:'', peso:'', temp:'', diagnostico:'', tratamiento:'' });
    cargar();
  }

  if (!pac) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <button onClick={() => router.push('/hoy')} style={{ marginBottom: 12, border: '1px solid #e5e7eb', background: 'white', padding: '8px 14px', borderRadius: 999 }}>← Hoy</button>

      <div style={{ background: '#111827', color: 'white', padding: 18, borderRadius: 18 }}>
        <h1 style={{ margin: 0, fontSize: 24 }}>{pac.nombre} - {pac.especie}</h1>
        <div style={{ fontSize: 13, opacity: 0.8, marginTop: 6 }}>
          Tutor: {pac.tutores?.nombre_completo}<br/>
          {pac.tutores?.telefono} | {fichas.length} atenciones guardadas
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, marginTop: 14 }}>
        <b>Nueva atención</b>
        <input placeholder="Motivo de hoy *" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Peso kg" type="number" value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
          <input placeholder="T°" type="number" value={form.temp} onChange={e => setForm({...form, temp: e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        </div>
        <input placeholder="Diagnóstico" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        <textarea placeholder="Tratamiento / Indicaciones" value={form.tratamiento} onChange={e => setForm({...form, tratamiento: e.target.value})} style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb', minHeight: 70 }} />
        <button onClick={guardar} style={{ width: '100%', marginTop: 10, background: '#2563eb', color: 'white', padding: 14, borderRadius: 12, border: 0, fontWeight: 800 }}>Guardar en historial</button>
      </div>

      <div style={{ marginTop: 18 }}>
        <b>Historial completo - no se borra</b>
        {fichas.length === 0 && <div style={{ marginTop: 10, color: '#6b7280', fontSize: 13 }}>Sin atenciones aún. La primera que guardes quedará aquí para siempre.</div>}
        {fichas.map(f => (
          <div key={f.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 12, marginTop: 10 }}>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(f.fecha).toLocaleString('es-CL')} {f.peso ? `• ${f.peso}kg` : ''} {f.temp ? `• ${f.temp}°C` : ''}</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>{f.motivo}</div>
            {f.diagnostico && <div style={{ fontSize: 13, marginTop: 4 }}>Dx: {f.diagnostico}</div>}
            {f.tratamiento && <div style={{ fontSize: 13, background: '#f9fafb', padding: 8, borderRadius: 8, marginTop: 6, whiteSpace: 'pre-wrap' }}>{f.tratamiento}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
