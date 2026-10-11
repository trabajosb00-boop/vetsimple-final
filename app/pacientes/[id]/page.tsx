'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase';

const MOTIVOS = [
  'Consulta',
  'Control',
  'Control post quirúrgico',
  'Vacunación',
  'Desparasitación',
  'Urgencia',
  'Cirugía',
  'Hospitalización',
  'Toma de exámenes',
  'Peluquería / Baño'
];

export default function FichaPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [pac, setPac] = useState<any>(null);
  const [fichas, setFichas] = useState<any[]>([]);
  const [form, setForm] = useState({ motivo: 'Consulta', peso: '', temp: '', diagnostico: '', tratamiento: '' });
  const [msg, setMsg] = useState('Cargando...');

  async function cargar() {
    const { data: p, error: e1 } = await supabase.from('pacientes').select('*, tutores(*)').eq('id', id).single();
    if (e1) setMsg('Error paciente: ' + e1.message);
    setPac(p);
    const { data: f, error: e2 } = await supabase.from('fichas_clinicas').select('*').eq('paciente_id', id).order('fecha', { ascending: false });
    if (e2) setMsg('Error historial: ' + e2.message);
    else setMsg(`${f?.length || 0} atenciones guardadas`);
    setFichas(f || []);
  }
  useEffect(() => { cargar(); }, []);

  async function guardar() {
    const { error } = await supabase.from('fichas_clinicas').insert({
      paciente_id: id,
      motivo: form.motivo,
      diagnostico: form.diagnostico,
      tratamiento: form.tratamiento,
      peso: form.peso ? Number(form.peso) : null,
      temp: form.temp ? Number(form.temp) : null,
    });
    if (error) { alert('No guardó: ' + error.message); return; }
    setForm({ motivo: 'Consulta', peso: '', temp: '', diagnostico: '', tratamiento: '' });
    cargar();
  }

  if (!pac) return <div style={{ padding: 20 }}>{msg}</div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <button onClick={() => router.push('/hoy')} style={{ border: '1px solid #e5e7eb', background: 'white', padding: '8px 14px', borderRadius: 999, marginBottom: 12 }}>← Hoy</button>

      <div style={{ background: '#111827', color: 'white', padding: 18, borderRadius: 18 }}>
        <h1 style={{ margin: 0, fontSize: 22 }}>{pac.nombre} - {pac.especie}</h1>
        <Link href={`/tutores/${pac.tutor_id || pac.tutores?.id}`} style={{ color: '#93c5fd', fontSize: 13, textDecoration: 'underline', marginTop: 6, display: 'inline-block' }}>
          Tutor: {pac.tutores?.nombre_completo} - Ver datos y mascotas →
        </Link>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 8 }}>{msg}</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 16, padding: 14, marginTop: 14 }}>
        <b>Nueva atención</b>
        <select value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value})} style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb', background: 'white' }}>
          {MOTIVOS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <input placeholder="Peso kg" type="number" value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
          <input placeholder="T° C" type="number" value={form.temp} onChange={e => setForm({...form, temp: e.target.value})} style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        </div>
        <input placeholder="Diagnóstico" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value})} style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb' }} />
        <textarea placeholder="Tratamiento / Indicaciones" value={form.tratamiento} onChange={e => setForm({...form, tratamiento: e.target.value})} style={{ width: '100%', marginTop: 8, padding: 12, borderRadius: 10, border: '1px solid #e5e7eb', minHeight: 80 }} />
        <button onClick={guardar} style={{ width: '100%', marginTop: 10, background: '#2563eb', color: 'white', padding: 14, borderRadius: 12, border: 0, fontWeight: 800 }}>Guardar en historial</button>
      </div>

      <div style={{ marginTop: 18 }}>
        <b>Historial completo</b>
        {fichas.map(f => (
          <div key={f.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 12, marginTop: 10 }}>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(f.fecha).toLocaleString('es-CL')} • {f.motivo} {f.peso ? `• ${f.peso}kg` : ''}</div>
            {f.diagnostico && <div style={{ fontSize: 13, marginTop: 4 }}><b>Dx:</b> {f.diagnostico}</div>}
            {f.tratamiento && <div style={{ fontSize: 13, background: '#f9fafb', padding: 8, borderRadius: 8, marginTop: 6, whiteSpace: 'pre-wrap' }}>{f.tratamiento}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
