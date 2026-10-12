'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useRouter } from 'next/navigation';
export default function VistaMedico(){
  const [citas,setCitas]=useState<any[]>([]); const router=useRouter();
  async function cargar(){
  const { data: {user} } = await supabase.auth.getUser();
  const { data: perfil } = await supabase.from('perfiles').select('veterinario_id').eq('id', user?.id).single();
  
  let query = supabase.from('agenda').select('*, pacientes(nombre), tutores(nombre_completo)').in('estado',['en_espera','en_atencion']);
  
  if(perfil?.veterinario_id){
    query = query.eq('veterinario_id', perfil.veterinario_id); // <- aquí filtra solo lo de él
  }
  
  const { data } = await query.order('fecha_hora');
  setCitas(data||[]);
}
