'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../supabase';

export default function TutorPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [tutor, setTutor] = useState<any>(null);
  const [mascotas, setMascotas] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: t } = await supabase.from('tutores').select('*').eq('id', id).single();
      setTutor(t);
      const { data: p } = await supabase.from('pacientes').select('*').eq('tutor_id', id);
      setMascotas(p || []);
    })();
  }, []);

  if (!tutor) return <div style={{ padding: 20 }}>Cargando tutor...</div>;
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16, fontFamily: 'system-ui' }}>
      <button onClick={() => router.back()} style={{ border: '1px solid #e5e7eb', background: 'white', padding: '8px 14px', borderRadius: 999, marginBottom: 12 }}>← Volver</button>
      <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 18, padding: 18 }}>
        <h1 style={{ margin: 0 }}>{tutor.nombre_completo}</h1>
        <div style={{ fontSize: 14, color: '#6b7280', marginTop: 8 }}>
          📞 {tutor.telefono || 'Sin teléfono'}<br/>
          ✉️ {tutor.email || 'Sin email'}<br/>
          📍 {tutor.direccion || 'Sin dirección'}
        </div>
        <div style={{ marginTop: 14, fontWeight: 700 }}>Mascotas ({mascotas.length})</div>
        {mascotas.map(m => (
          <Link key={m.id} href={`/pacientes/${m.id}`} style={{ display: 'block', textDecoration: 'none', color: 'black', background: '#f9fafb', border: '1px solid #e5e7eb', padding: 12, borderRadius: 12, marginTop: 8 }}>
            <b>{m.nombre}</b> - {m.especie} {m.raza ? `• ${m.raza}` : ''} →
          </Link>
        ))}
      </div>
    </div>
  );
}
