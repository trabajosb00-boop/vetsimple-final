'use client';
import { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
export default function Admin(){
  const [users,setUsers]=useState<any[]>([]); const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const [rol,setRol]=useState('recepcion'); const [nombre,setNombre]=useState('');
  async function cargar(){const {data}=await supabase.from('perfiles').select('*'); setUsers(data||[]);}
  useEffect(()=>{cargar();},[]);
  async function crear(){
    const {data,error}=await supabase.auth.signUp({email,password:pass});
    if(error) return alert(error.message);
    await supabase.from('perfiles').insert({id:data.user?.id,email,nombre,rol,activo:true});
    cargar();
  }
  return(<div style={{maxWidth:600,margin:'0 auto',padding:16,fontFamily:'system-ui'}}><h1 style={{fontWeight:800}}>Admin Usuarios</h1><div style={{background:'white',padding:12,borderRadius:12,border:'1px solid #e5e7eb',marginTop:12}}><input value={nombre} onChange={e=>setNombre(e.target.value)} placeholder="Nombre" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginBottom:6}}/><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginBottom:6}}/><input value={pass} onChange={e=>setPass(e.target.value)} placeholder="Clave" type="password" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb'}}/><select value={rol} onChange={e=>setRol(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #e5e7eb',marginTop:6}}><option value="admin">admin</option><option value="recepcion">recepcion</option><option value="medico">medico</option><option value="caja">caja</option></select><button onClick={crear} style={{width:'100%',marginTop:10,background:'#111827',color:'white',padding:10,borderRadius:10}}>Crear</button></div>{users.map((u:any)=><div key={u.id} style={{background:'white',border:'1px solid #e5e7eb',borderRadius:10,padding:10,marginTop:8}}>{u.email} - {u.rol}</div>)}</div>);
}
