'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase';

const MOTIVOS = ['Consulta','Control','Control post quirúrgico','Vacunación','Desparasitación','Urgencia','Cirugía','Hospitalización','Toma de exámenes'];

function colorMotivo(motivo: string) {
  if (motivo === 'Urgencia') return '#dc2626'; // rojo funcional = urgencia
  if (motivo === 'Control post quirúrgico') return '#f59e0b'; // amarillo = cuidado
  return '#16a34a'; // verde = consulta normal
}

export default function FichaCompleta() {
  const { id } = useParams() as { id: string };
  const searchParams = useSearchParams();
  const medicoParam = searchParams.get('medico');
  const router = useRouter();
  const [pac, setPac] = useState<any>(null);
  const [vets, setVets] = useState<any[]>([]);
  const [fichas, setFichas] = useState<any[]>([]);
  const [archivos, setArchivos] = useState<any>({});
  const [form, setForm] = useState({ motivo: 'Consulta', resena: '', peso: '', temp: '', anamnesis: '', examen: '', diagnostico: '', tratamiento: '', orden_examen: '', derivacion: '', veterinario_id: '' });
  const [file, setFile] = useState<File | null>(null);
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    const { data: p } = await supabase.from('pacientes').select('*, tutores(*)').eq('id', id).single();
    setPac(p);
    const { data: v } = await supabase.from('veterinarios').select('*');
    setVets(v || []);
    if (v && v.length > 0) setForm(f => ({...f, veterinario_id: medicoParam || v[0].id }));
    const { data: fich } = await supabase.from('fichas_clinicas').select('*, veterinarios(nombre_completo)').eq('paciente_id', id).order('fecha', { ascending: false });
    setFichas(fich || []);
    // cargar archivos de cada ficha
    if (fich && fich.length > 0) {
      for (const f of fich) {
        const { data: arch } = await supabase.from('fichas_archivos').select('*').eq('ficha_id', f.id);
        if (arch && arch.length > 0) setArchivos((prev: any) => ({...prev, [f.id]: arch }));
      }
    }
  }
  useEffect(() => { cargar(); }, [id, medicoParam]);

  async function guardar() {
    if (!form.diagnostico &&!form.anamnesis) return alert('Escribe al menos anamnesis o diagnóstico');
    setGuardando(true);
    const { data: nueva, error } = await supabase.from('fichas_clinicas').insert({
      paciente_id: id,
      veterinario_id: form.veterinario_id || null,
      motivo: form.motivo,
      resena: form.resena,
      peso: form.peso? Number(form.peso) : null,
      temp: form.temp? Number(form.temp) : null,
      anamnesis: form.anamnesis,
      examen: form.examen,
      diagnostico: form.diagnostico,
      tratamiento: form.tratamiento,
      orden_examen: form.orden_examen,
      derivacion: form.derivacion
    }).select('id').single();

    if (error) { alert(error.message); setGuardando(false); return; }

    if (file && nueva) {
      const path = `${id}/${nueva.id}_${file.name}`;
      const { error: upErr } = await supabase.storage.from('fichas').upload(path, file);
      if (!upErr) {
        const { data: url } = supabase.storage.from('fichas').getPublicUrl(path);
        await supabase.from('fichas_archivos').insert({ ficha_id: nueva.id, url: url.publicUrl, nombre: file.name, tipo: file.type });
      }
    }
    setForm({ motivo: 'Consulta', resena: '', peso: '', temp: '', anamnesis: '', examen: '', diagnostico: '', tratamiento: '', orden_examen: '', derivacion: '', veterinario_id: form.veterinario_id });
    setFile(null); setGuardando(false); cargar();
  }

  async function compartir(f: any) {
    const tel = pac?.tutores?.telefono?.replace(/\D/g, '');
    const texto = `Ficha de ${pac?.nombre} - ${f.motivo} - ${new Date(f.fecha).toLocaleDateString()} - Dr. ${f.veterinarios?.nombre_completo}\nDx: ${f.diagnostico || ''}\nTto: ${f.tratamiento || ''}\nVer: ${window.location.href}`;
    if (tel) window.open(`https://wa.me/${tel}?text=${encodeURIComponent(texto)}`, '_blank');
    else alert('Tutor sin WhatsApp registrado');
  }

  if (!pac) return <div style={{ padding: 20 }}>Cargando ficha...</div>;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: 12, fontFamily: 'system-ui' }}>
      <button onClick={() => router.push('/hoy')} style={{ border: '1px solid #e5e7eb', background: 'white', padding: '8px 12px', borderRadius: 999 }}>← Sala</button>

      <div style={{ background: '#111827', color: 'white', padding: 14, borderRadius: 14, marginTop: 10 }}>
        <div style={{ fontSize: 20, fontWeight: 800 }}>{pac.nombre} - {pac.especie} {pac.raza? `• ${pac.raza}` : ''}</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>{pac.sexo || ''} {pac.edad? `• ${pac.edad} años` : ''} • Último peso: {fichas[0]?.peso || '-'} kg • {fichas[0]? `Última T° ${fichas[0].temp || '-'}°` : ''}</div>
        <Link href={`/tutores/${pac.tutor_id}`} style={{ color: '#93c5fd', fontSize: 12, textDecoration: 'underline', marginTop: 6, display: 'inline-block' }}>Tutor: {pac.tutores?.nombre_completo} → ver datos y mascotas</Link>
        <div style={{ fontSize: 11, opacity: 0.6, marginTop: 6 }}>{fichas.length} atenciones - haz scroll para trazabilidad</div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 14, padding: 12, marginTop: 12 }}>
        <b style={{ fontSize: 14 }}>Nueva atención - {vets.find(v => v.id === form.veterinario_id)?.nombre_completo || 'Sin médico'}</b>
        <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
          <select value={form.motivo} onChange={e => setForm({...form, motivo: e.target.value })} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}>{MOTIVOS.map(m => <option key={m}>{m}</option>)}</select>
          <select value={form.veterinario_id} onChange={e => setForm({...form, veterinario_id: e.target.value })} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }}>{vets.map(v => <option key={v.id} value={v.id}>🩺 {v.nombre_completo}</option>)}</select>
        </div>
        <textarea placeholder="Reseña real por la que vino - esto aparece en sala para orientar al médico" value={form.resena} onChange={e => setForm({...form, resena: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', minHeight: 50, background: '#f9fafb' }} />
        <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input placeholder="Peso kg" value={form.peso} onChange={e => setForm({...form, peso: e.target.value })} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
          <input placeholder="T° C" value={form.temp} onChange={e => setForm({...form, temp: e.target.value })} style={{ flex: 1, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        </div>
        <textarea placeholder="Anamnesis" value={form.anamnesis} onChange={e => setForm({...form, anamnesis: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <textarea placeholder="Examen clínico" value={form.examen} onChange={e => setForm({...form, examen: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <input placeholder="Diagnóstico" value={form.diagnostico} onChange={e => setForm({...form, diagnostico: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb', fontWeight: 600 }} />
        <textarea placeholder="Tratamiento / Indicaciones" value={form.tratamiento} onChange={e => setForm({...form, tratamiento: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <textarea placeholder="🔬 Orden de examen Ej: Hemograma + Rx tórax laterolateral" value={form.orden_examen} onChange={e => setForm({...form, orden_examen: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #fbbf24', background: '#fffbeb' }} />
        <textarea placeholder="➡️ Derivación Ej: Derivo a especialista traumatología" value={form.derivacion} onChange={e => setForm({...form, derivacion: e.target.value })} style={{ width: '100%', marginTop: 6, padding: 10, borderRadius: 8, border: '1px solid #93c5fd', background: '#eff6ff' }} />
        <div style={{ marginTop: 8 }}>
          <label style={{ fontSize: 12, fontWeight: 600 }}>📎 Adjuntar imagen/Rx/documento</label>
          <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} style={{ display: 'block', marginTop: 4 }} accept="image/*,.pdf,.doc,.docx" />
        </div>
        <button onClick={guardar} disabled={guardando} style={{ width: '100%', marginTop: 12, background: guardando? '#9ca3af' : '#2563eb', color: 'white', padding: 12, borderRadius: 10, fontWeight: 800, border: 0 }}>{guardando? 'Guardando...' : 'Guardar en historial'}</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <b style={{ fontSize: 14 }}>Historial completo - {fichas.length} fichas - scroll</b>
        {fichas.map(f => (
          <div key={f.id} style={{ background: 'white', border: '1px solid #e5e7eb', borderLeft: `6px solid ${colorMotivo(f.motivo)}`, borderRadius: 12, padding: 12, marginTop: 10 }}>
            <div style={{ fontSize: 11, color: '#6b7280' }}>{new Date(f.fecha).toLocaleString('es-CL')} • {f.motivo} • 🩺 {f.veterinarios?.nombre_completo || 'Sin médico'} {f.peso? `• ${f.peso}kg` : ''}</div>
            {f.resena && <div style={{ fontSize: 12, marginTop: 6, background: '#f9fafb', padding: 8, borderRadius: 8 }}><b>Por qué vino:</b> {f.resena}</div>}
            {f.anamnesis && <div style={{ fontSize: 12, marginTop: 6 }}><b>Anamnesis:</b> {f.anamnesis}</div>}
            {f.examen && <div style={{ fontSize: 12, marginTop: 4 }}><b>Examen:</b> {f.examen}</div>}
            {f.diagnostico && <div style={{ fontSize: 13, marginTop: 6, fontWeight: 700 }}>Dx: {f.diagnostico}</div>}
            {f.tratamiento && <div style={{ fontSize: 12, marginTop: 4, background: '#f9fafb', padding: 8, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{f.tratamiento}</div>}
            {f.orden_examen && <div style={{ fontSize: 12, marginTop: 8, background: '#fffbeb', padding: 8, borderRadius: 8, border: '1px dashed #f59e0b' }}>🔬 <b>Orden:</b> {f.orden_examen}</div>}
            {f.derivacion && <div style={{ fontSize: 12, marginTop: 8, background: '#eff6ff', padding: 8, borderRadius: 8, border: '1px dashed #2563eb' }}>➡️ <b>Deriva:</b> {f.derivacion}</div>}
            {archivos[f.id]?.length > 0 && <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>{archivos[f.id].map((a: any) => <a key={a.id} href={a.url} target="_blank" style={{ fontSize: 11, color: '#2563eb', background: '#eff6ff', padding: '4px 8px', borderRadius: 999, textDecoration: 'none' }}>📎 {a.nombre}</a>)}</div>}
            <button onClick={() => compartir(f)} style={{ marginTop: 10, fontSize: 11, background: '#dcfce7', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: 999, fontWeight: 600 }}>📲 Enviar por WhatsApp al tutor</button>
          </div>
        ))}
      </div>
    </div>
  );
}
