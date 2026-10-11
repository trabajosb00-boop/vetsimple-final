'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../supabase';

export default function FichaPaciente() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [pac, setPac] = useState<any>(null);
  const [fichas, setFichas] = useState<any[]>([]);
  const [form, setForm] = useState({ motivo:'', anamnesis:'', examen:'', diagnostico:'', tratamiento:'', peso:'', temp:'' });
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    const { data: p } = await supabase.from('pacientes').select('*, tutores(*)').eq('id', id).single();
    setPac(p);
    const { data: f } = await supabase.from('fichas_clinicas').select('*').eq('paciente_id', id).order('fecha', { ascending: false });
    setFichas(f || []);
    setLoading(false);
  }
  useEffect(() => { cargar(); }, []);

  async function guardar() {
    if (!form.motivo) { alert('Pon motivo'); return; }
    await supabase.from('fichas_clinicas').insert({ 
      paciente_id: id, 
      motivo: form.motivo, 
      anamnesis: form.anamnesis, 
      examen: form.examen, 
      diagnostico: form.diagnostico, 
      tratamiento: form.tratamiento, 
      peso: form.peso ? Number(form.peso) : null, 
      temp: form.temp ? Number(form.temp) : null 
    });
    setForm({ motivo:'', anamnesis:'', examen:'', diagnostico:'', tratamiento:'', peso:'', temp:'' });
    cargar();
  }

  if (loading) return <div style={{ padding: 20 }}>Cargando ficha...</div>;
  if (!pac) return <div style={{ padding: 20 }}>Paciente no encontrado</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <button onClick={() => router.push('/hoy')} style={{ marginBottom: 12, background: 'white', border: '1px solid #e5e7eb', padding: '8px 12px', borderRadius: 999 }}>← Volver a Hoy</button>
      
      <div style={{ background: 'black', color: 'white', padding: 20, borderRadius: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>{pac.nombre} - {pac.especie}</h1>
        <div style={{ opacity: 0.8 }}>{pac.raza} | Tutor: {pac.tutores?.nombre_completo} | {pac.tutores?.telefono}</div>
      </div>

      <div style={{ background: 'white', padding: 16, borderRadius: 16, border: '1px solid #e5e7eb', marginTop: 16 }}>
        <h3 style={{ marginTop: 0 }}>Nueva atención</h3>
        <div style={{ display: 'grid', gap: 8 }}>
          <input placeholder="Motivo consulta" value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
          <div style={{ display: 'flex', gap: 8 }}><input placeholder="Peso kg" type="number" value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} /><input placeholder="Temp °C" type="number" value={form.temp} onChange={e => setForm({...form, temp: e.target.value})} style={{ flex: 1, padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} /></div>
          <textarea placeholder="Anamnesis" value={form.anamnesis} onChange={e => setForm({...form, anamnesis: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', minHeight: 60 }} />
          <textarea placeholder="Examen físico" value={form.examen} onChange={e => setForm({...form, examen: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb', minHeight: 60 }} />
          <textarea placeholder="Diagnóstico" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
          <textarea placeholder="Tratamiento / Receta" value={form.tratamiento} onChange={e => setForm({...form, tratamiento: e.target.value})} style={{ padding: 10, borderRadius: 10, border: '1px solid #e5e7eb' }} />
          <button onClick={guardar} style={{ background: '#2563eb', color: 'white', padding: 12, borderRadius: 12, border: 0, fontWeight: 800 }}>Guardar ficha</button>
        </div>
      </div>

      <h3 style={{ marginTop: 20 }}>Historial ({fichas.length})</h3>
      {fichas.map(f => (
        <div key={f.id} style={{ background: 'white', padding: 14, borderRadius: 14, border: '1px solid #e5e7eb', marginBottom: 10 }}>
          <div style={{ fontSize: 12, color: '#6b7280' }}>{new Date(f.fecha).toLocaleString()} | {f.peso ? `${f.peso}kg` : ''} {f.temp ? `${f.temp}°C` : ''}</div>
          <div style={{ fontWeight: 700, marginTop: 4 }}>{f.motivo}</div>
          {f.diagnostico && <div style={{ fontSize: 13, marginTop: 4 }}><b>Dx:</b> {f.diagnostico}</div>}
          {f.tratamiento && <div style={{ fontSize: 13, background: '#f3f4f6', padding: 8, borderRadius: 8, marginTop: 6 }}>{f.tratamiento}</div>}
        </div>
      ))}
    </div>
  );
}
