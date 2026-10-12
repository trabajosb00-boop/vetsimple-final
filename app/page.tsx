'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from './supabase';
export default function Inicio(){
  const [rol,setRol]=useState('recepcion');
  useEffect(()=>{(async()=>{const {data:{user}}=await supabase.auth.getUser(); if(!user) location.href='/login'; const {data:p}=await supabase.from('perfiles').select('rol').eq('id',user?.id).single(); setRol(p?.rol||'recepcion');})();},[]);
  const cards=[
    {href:'/hoy',label:'Sala Espera',icon:'🏥',roles:['admin','recepcion','medico']},
    {href:'/medico',label:'Vista Médico',icon:'🩺',roles:['admin','medico']},
    {href:'/pacientes/nuevo',label:'Nuevo Paciente',icon:'➕',roles:['admin','recepcion']},
    {href:'/agenda',label:'Agenda',icon:'📅',roles:['admin','recepcion']},
    {href:'/admin/usuarios',label:'Admin Usuarios',icon:'⚙️',roles:['admin']},
  ];
  return(<div style={{maxWidth:700,margin:'0 auto',padding:16,fontFamily:'system-ui'}}><h1 style={{fontWeight:800}}>Inicio - {rol}</h1><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginTop:12}}>{cards.filter(c=>c.roles.includes(rol)).map(c=><Link key={c.href} href={c.href} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:14,padding:20,textAlign:'center',textDecoration:'none',color:'black',fontWeight:700}}><div style={{fontSize:28}}>{c.icon}</div>{c.label}</Link>)}</div>
  <div style={{position:'fixed',bottom:0,left:0,right:0,background:'white',borderTop:'1px solid #e5e7eb',display:'flex',justifyContent:'space-around',padding:'8px 0'}}><Link href="/">Inicio</Link><Link href="/hoy">Sala</Link><Link href="/medico">Médico</Link><Link href="/chat/0">Chat</Link></div>
  </div>);
}
