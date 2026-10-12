'use client'
import { useState } from 'react'
export default function BoxPage(){
  const [soap,setSoap]=useState('Paciente con decaimiento hace 24h, vomito esporádico...')
  return(
    <div className="min-h-screen bg-[#FFFBF7]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); *{font-family:Inter}`}</style>
      <div className="max-w-[1600px] mx-auto px-6 py-4 flex justify-between items-center border-b border-black/5">
        <div className="flex gap-6 items-center">
          <h1 className="text-[28px] font-extrabold">VetSimple</h1>
          <div className="hidden md:flex bg-white rounded-full p-1 border">
            <a href="/hoy" className="px-5 py-2 rounded-full text-sm text-[#6b7280]">/HOY</a>
            <span className="px-5 py-2 rounded-full bg-[#0F172A] text-white text-sm font-semibold">/BOX</span>
            <a href="/caja" className="px-5 py-2 rounded-full text-sm text-[#6b7280]">/CAJA</a>
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-1 rounded-full bg-white border text-[12px]">FC 88</span>
          <span className="px-3 py-1 rounded-full bg-white border text-[12px]">T° 38.5</span>
          <span className="px-3 py-1 rounded-full bg-white border text-[12px]">FR 24</span>
        </div>
      </div>
      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-[20px] p-6 border shadow-sm">
          <div className="flex gap-3 items-center mb-6">
            <div className="w-12 h-12 rounded-[14px] bg-[#FFFBF7] flex items-center justify-center text-[22px]">🐶</div>
            <div><h2 className="text-[20px] font-bold">Milo - Canino Labrador 3a</h2><p className="text-[13px] text-[#6b7280]">Bastian Gajardo • +56912345678</p></div>
          </div>
          <div className="flex gap-2 mb-6">
            <div className="flex-1 h-[48px] rounded-[14px] bg-[#0F172A] flex items-center justify-center gap-2 text-white text-[13px] font-bold"><span>●</span> Grabando...<div className="flex gap-1 ml-2"><div className="w-1 h-4 bg-white/80 rounded-full animate-pulse"/><div className="w-1 h-6 bg-white rounded-full animate-pulse"/><div className="w-1 h-3 bg-white/60 rounded-full animate-pulse"/></div></div>
            <button className="h-[48px] px-5 rounded-[14px] border font-semibold text-[13px]">Pausar</button>
          </div>
          <textarea value={soap} onChange={e=>setSoap(e.target.value)} className="w-full h-[320px] rounded-[16px] border border-black/10 p-4 text-[15px] leading-6 focus:outline-none" placeholder="SOAP..." />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <button className="h-[60px] rounded-[24px] bg-[#16A34A] text-white font-bold shadow-[0_4px_12px_rgba(22,163,74,0.25)]">Vacuna</button>
            <button className="h-[60px] rounded-[24px] bg-[#0F172A] text-white font-bold">Receta SAG</button>
            <button className="h-[60px] rounded-[24px] bg-white border border-black/10 font-bold">Examen</button>
            <button className="h-[60px] rounded-[24px] bg-white border border-black/10 font-bold">Alta</button>
          </div>
        </div>
        <div className="bg-[#f3eee8]/60 rounded-[20px] p-4">
          <h3 className="text-[12px] font-bold tracking-widest text-[#0F172A]/60 mb-3">HISTORIAL</h3>
          <div className="flex flex-col gap-3">
            <div className="bg-white rounded-[16px] p-4 border"><p className="text-[13px] font-bold">12 Oct - Control</p><p className="text-[12px] text-[#6b7280]">Peso 22kg, vacuna antirrábica</p></div>
            <div className="bg-white rounded-[16px] p-4 border"><p className="text-[13px] font-bold">02 Sep - Consulta</p><p className="text-[12px] text-[#6b7280]">Vómito, se indicó dieta blanda</p></div>
          </div>
        </div>
      </div>
    </div>
  )
}
