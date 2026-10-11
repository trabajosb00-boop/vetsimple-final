'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../supabase';

const ESTADOS: any = {
  agendada: { label: 'Check-in', color: '#111827', next: 'en_espera', prev: null },
  en_espera: { label: 'En espera', color: '#ef4444', next: 'en_atencion', prev: 'agendada' },
  en_atencion: { label: 'En atención', color: '#2563eb', next: 'atendida', prev: 'en_espera' },
  en_sala: { label: 'En atención', color: '#2563eb', next: 'atendida', prev: 'en_espera' },
  atendida: { label: 'Atendido ✓', color: '#16a34a', next: null, prev: 'en_atencion' },
  cancelada: { label: 'Cancelada', color: '#6b7280', next: null, prev: 'agendada' },
};

export default function HoyPage() {
  const [citas, setCitas] = useState<any[]>([]);
  const [total, setTotal] = useState(0);

  async function cargar() {
    const { count } = await supabase.from('agenda').select('*', { count: 'exact', head: true });
    setTotal(count || 0);
    const { data } = await supabase.from('agenda').select('*, pacientes(nombre, especie), tutores(nombre_completo)').order('fecha_hora');
    setCitas(data || []);
  }
  useEffect(() => { cargar(); }, []);

  async function cambiar(id: string, nuevoEstado: string, motivo: string | null = null) {
    const upd: any = { estado: nuevoEstado };
    if (nuevoEstado === 'cancelada') upd.motivo_cancelacion = motivo;
    if (nuevoEstado === 'agendada') upd.motivo_cancelacion = null;
    const { error } = await supabase.from('agenda').update(upd).eq('id', id);
    if (error) alert(error.message);
    cargar();
  }

  function cancelar(cita: any) {
    const motivo = prompt('¿Motivo de cancelación? Ej: Tutor no llegó, reagenda, etc.');
    if (motivo === null) return;
    if (!motivo.trim()) { alert('Debes escribir un motivo'); return; }
    cambiar(cita.id, 'cancelada', motivo.trim());
  }

  return (
    <div style={{ maxWidth: 650, margin: '0 auto', padding: 20, fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hoy - Recepción</h1>
      <div style={{ background: 'white', padding: 12, borderRadius: 12, marginBottom: 16, border: '1px solid #e5e7eb' }}>Total: {total} | Mostrando: {citas.length}</div>
      {citas.map((c: any) => {
        const cfg = ESTADOS[c.estado] || ESTADOS.agendada;
        const prevCfg = cfg.prev ? ESTADOS[cfg.prev] : null;
        return (
          <div key={c.id} style={{ background: 'white', padding: 16, borderRadius: 18, border: `2px solid ${cfg.color}`, marginBottom: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 800 }}>
                  <Link href={`/pacientes/${c.paciente_id}`} style={{ color: 'black', textDecoration: 'underline' }}>
                    {c.pacientes?.nombre} - {c.pacientes?.especie}
                  </Link>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280' }}>{c.tutores?.nombre_completo} | {c.estado} {c.motivo_cancelacion ? `| Motivo: ${c.motivo_cancelacion}` : ''}</div>
              </div>
              {cfg.next && <button onClick={() => cambiar(c.id, cfg.next!)} style={{ background: cfg.color, color: 'white', padding: '10px 18px', borderRadius: 999, border: 0, fontWeight: 800 }}>{cfg.label}</button>}
              {!cfg.next && c.estado !== 'cancelada' && <span style={{ background: cfg.color, color: 'white', padding: '10px 18px', borderRadius: 999, fontWeight: 800 }}>{cfg.label}</span>}
              {c.estado === 'cancelada' && <span style={{ background: cfg.color, color: 'white', padding: '10px 18px', borderRadius: 999, fontWeight: 800 }}>Cancelada</span>}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <Link href={`/pacientes/${c.paciente_id}`} style={{ background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#111827', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, textDecoration: 'none' }}>📋 Ver ficha</Link>
              {prevCfg && <button onClick={() => cambiar(c.id, cfg.prev!)} style={{ background: 'white', border: `1px solid ${prevCfg.color}`, color: prevCfg.color, padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>↩ Volver a {prevCfg.label}</button>}
              {c.estado === 'cancelada' && <button onClick={() => cambiar(c.id, 'agendada')} style={{ background: '#111827', color: 'white', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>↩ Reactivar cita</button>}
              {c.estado !== 'cancelada' && c.estado !== 'atendida' && <button onClick={() => cancelar(c)} style={{ marginLeft: 'auto', background: 'white', border: '1px solid #ef4444', color: '#ef4444', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>✕ Cancelar</button>}
              {c.estado === 'atendida' && <button onClick={() => cambiar(c.id, 'agendada')} style={{ marginLeft: 'auto', background: 'white', border: '1px solid #111827', color: '#111827', padding: '6px 12px', borderRadius: 999, fontSize: 12 }}>↩ Reabrir por error</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
