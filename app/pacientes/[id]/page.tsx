'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '../../supabase';
import jsPDF from 'jspdf';

export default function FichaClinica(){
  const {id}=useParams() as {id:string};
  const [pac,setPac]=useState<any>(null); const [tutor,setTutor]=useState<any>(null);
  const [fichas,setFichas]=useState<any[]>([]); const [form,setForm]=useState({anamnesis:'',examen:'',diagnostico:'',tratamiento:'',indicaciones:''});

  async function cargar(){
    const {data:p}=await supabase.from('pacientes').select('*, tutores(*)').eq('id',id).single(); setPac(p); setTutor(p?.tutores);
    const {data:f}=await supabase.from('fichas').select('*').eq('paciente_id',id).order('created_at',{ascending:false}); setFichas(f||[]);
  }
  useEffect(()=>{cargar();},[id]);

  async function guardarFicha(){
    if(!form.anamnesis) return alert('Escribe anamnesis');
    await supabase.from('fichas').insert({paciente_id:id,...form}); setForm({anamnesis:'',examen:'',diagnostico:'',tratamiento:'',indicaciones:''}); cargar();
  }

  async function crearPDF(f:any){
    const doc = new jsPDF();
    doc.setFillColor(17,24,39); doc.rect(0,0,210,22,'F');
    doc.setTextColor(255,255,255); doc.setFontSize(14); doc.text('VETSIMPLE - Ficha Clínica',10,14);
    doc.setTextColor(0,0,0); doc.setFontSize(11);
    doc.text(`Paciente: ${pac.nombre} (${pac.especie} - ${pac.raza}) Edad: ${pac.edad}`,10,32);
    doc.text(`Tutor: ${tutor.nombre_completo} RUT: ${tutor.rut} Tel: ${tutor.telefono}`,10,38);
    doc.text(`Fecha: ${new Date(f.created_at).toLocaleString()} Médico: ${f.medico||'Dra. Karen'}`,10,44);
    doc.line(10,48,200,48);
    let y=56; [['Anamnesis',f.anamnesis],['Examen',f.examen],['Diagnóstico',f.diagnostico],['Tratamiento',f.tratamiento],['Indicaciones',f.indicaciones]].forEach(([t,v]:any)=>{doc.setFont('helvetica','bold'); doc.text(t+':',10,y); doc.setFont('helvetica','normal'); const lines=doc.splitTextToSize(v||'-',180); doc.text(lines,10,y+6); y+= 10 + lines.length*5;});
    const blob = doc.output('blob');
    const fileName = `Ficha_${pac.nombre}_${f.id.slice(0,6)}.pdf`;
    await supabase.storage.from('fichas').upload(fileName, blob, {upsert:true});
    const {data} = supabase.storage.from('fichas').getPublicUrl(fileName);
    return {url:data.publicUrl, blob, fileName};
  }

  async function enviarWA(f:any){
    const {url} = await crearPDF(f);
    window.open(`https://wa.me/56${tutor.telefono.replace(/\D/g,'').slice(-9)}?text=Hola ${tutor.nombre_completo}, te envío ficha de ${pac.nombre}: ${url}`, '_blank');
  }
  async function enviarMail(f:any){
    const {url} = await crearPDF(f);
    window.open(`mailto:${tutor.email}?subject=Ficha ${pac.nombre}&body=Adjunto ficha clínica: ${url}`, '_blank');
  }

  if(!pac) return <div style={{padding:20}}>Cargando...</div>;
  return(
    <div style={{maxWidth:700,margin:'0 auto',padding:16,fontFamily:'system-ui',background:'#f8fafc',minHeight:'100vh'}}>
      <div style={{background:'white',borderRadius:16,padding:14,border:'1px solid #e5e7eb'}}><div style={{fontWeight:800}}>{pac.nombre} - {pac.raza}</div><div style={{fontSize:12,color:'#6b7280'}}>{tutor.nombre_completo} • {tutor.telefono}</div></div>

      <div style={{background:'white',borderRadius:16,padding:12,marginTop:12,border:'1px solid #e5e7eb'}}>
        <b>Nueva atención</b>
        <textarea value={form.anamnesis} onChange={e=>setForm({...form,anamnesis:e.target.value})} placeholder="Anamnesis" style={{width:'100%',marginTop:8,padding:10,borderRadius:10,border:'1px solid #e5e7eb',minHeight:60}}/>
        <textarea value={form.examen} onChange={e=>setForm({...form,examen:e.target.value})} placeholder="Examen clínico" style={{width:'100%',marginTop:6,padding:10,borderRadius:10,border:'1px solid #e5e7eb'}}/>
        <input value={form.diagnostico} onChange={e=>setForm({...form,diagnostico:e.target.value})} placeholder="Diagnóstico" style={{width:'100%',marginTop:6,padding:10,borderRadius:10,border:'1px solid #e5e7eb'}}/>
        <textarea value={form.tratamiento} onChange={e=>setForm({...form,tratamiento:e.target.value})} placeholder="Tratamiento" style={{width:'100%',marginTop:6,padding:10,borderRadius:10,border:'1px solid #e5e7eb'}}/>
        <button onClick={guardarFicha} style={{width:'100%',marginTop:10,background:'#111827',color:'white',padding:12,borderRadius:12,fontWeight:700}}>Guardar ficha</button>
      </div>

      <div style={{marginTop:16}}><b>Historial con scroll - {fichas.length} fichas</b>
        <div style={{maxHeight:500,overflowY:'auto',display:'flex',flexDirection:'column',gap:10,marginTop:8,paddingRight:4}}>
          {fichas.map(f=><div key={f.id} style={{background:'white',borderRadius:14,padding:12,border:'1px solid #e5e7eb'}}>
            <div style={{fontSize:11,color:'#6b7280'}}>{new Date(f.created_at).toLocaleString()}</div>
            <div style={{fontSize:13,marginTop:4}}><b>Diag:</b> {f.diagnostico}</div><div style={{fontSize:12,marginTop:4,whiteSpace:'pre-wrap'}}>{f.anamnesis}</div>
            <div style={{display:'flex',gap:6,marginTop:10}}>
              <button onClick={()=>crearPDF(f).then(({url})=>window.open(url,'_blank'))} style={{flex:1,background:'#f3f4f6',border:'1px solid #e5e7eb',padding:8,borderRadius:999,fontSize:12}}>📄 Ver PDF</button>
              <button onClick={()=>enviarWA(f)} style={{flex:1,background:'#25D366',color:'white',border:0,padding:8,borderRadius:999,fontSize:12}}>WhatsApp PDF</button>
              <button onClick={()=>enviarMail(f)} style={{flex:1,background:'#2563eb',color:'white',border:0,padding:8,borderRadius:999,fontSize:12}}>Email PDF</button>
            </div>
          </div>)}
        </div>
      </div>
    </div>
  )
}
