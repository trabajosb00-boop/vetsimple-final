'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../supabase';
export default function Login(){
  const [email,setEmail]=useState(''); const [pass,setPass]=useState(''); const router=useRouter();
  async function entrar(){
    const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
    if(error) return alert(error.message);
    router.push('/?v=25');
  }
  return(<div style={{maxWidth:400,margin:'80px auto',padding:20,fontFamily:'system-ui'}}><h1 style={{fontWeight:800,fontSize:24}}>VetSimple Login</h1><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo" style={{width:'100%',padding:12,borderRadius:10,border:'1px solid #e5e7eb',marginTop:12}}/><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Clave" style={{width:'100%',padding:12,borderRadius:10,border:'1px solid #e5e7eb',marginTop:8}}/><button onClick={entrar} style={{width:'100%',marginTop:12,background:'#111827',color:'white',padding:12,borderRadius:10,fontWeight:800}}>Entrar</button></div>);
}
