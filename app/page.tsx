'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Page() {
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()
  function entrar(e:any){
    e.preventDefault()
    if(correo==='admin@vetsimple.cl' && clave==='admin123'){
      localStorage.setItem('vetsimple_admin','true')
      router.push('/hoy')
    } else {
      setError('Correo o clave incorrecta')
    }
  }
  return(
    <div style={{maxWidth:380,margin:'100px auto',padding:20,fontFamily:'system-ui'}}>
      <h1 style={{fontWeight:800,textAlign:'center'}}>VetSimple Login</h1>
      <form onSubmit={entrar} style={{display:'flex',flexDirection:'column',gap:12,marginTop:24}}>
        <input placeholder="Correo" value={correo} onChange={e=>setCorreo(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #ddd'}}/>
        <input placeholder="Clave" type="password" value={clave} onChange={e=>setClave(e.target.value)} style={{padding:12,borderRadius:10,border:'1px solid #ddd'}}/>
        <button type="submit" style={{padding:12,borderRadius:10,background:'#111',color:'white',fontWeight:700}}>Entrar</button>
        {error && <div style={{color:'red',textAlign:'center'}}>{error}</div>}
      </form>
      <p style={{fontSize:12,color:'#888',textAlign:'center',marginTop:12}}>admin@vetsimple.cl / admin123</p>
    </div>
  )
}
