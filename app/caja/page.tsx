'use client'
export default function CajaPage(){
  return(
    <div className="min-h-screen bg-[#FFFBF7]">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap'); *{font-family:Inter}`}</style>
      <div className="max-w-[1200px] mx-auto px-6 py-4 flex justify-between items-center border-b border-black/5">
        <div className="flex gap-6 items-center">
          <h1 className="text-[28px] font-extrabold">VetSimple</h1>
          <div className="hidden md:flex bg-white rounded-full p-1 border">
            <a href="/hoy" className="px-5 py-2 rounded-full text-sm text-[#6b7280]">/HOY</a>
            <a href="/box" className="px-5 py-2 rounded-full text-sm text-[#6b7280]">/BOX</a>
            <span className="px-5 py-2 rounded-full bg-[#0F172A] text-white text-sm font-semibold">/CAJA</span>
          </div>
        </div>
      </div>
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-[20px] p-6 border shadow-sm"><p className="text-[12px] font-bold tracking-widest text-[#6b7280]">INGRESOS HOY</p><p className="text-[28px] font-extrabold mt-1">$540.000</p><p className="text-[12px] text-[#16A34A]">+12% vs ayer</p></div>
          <div className="bg-white rounded-[20px] p-6 border shadow-sm"><p className="text-[12px] font-bold tracking-widest text-[#6b7280]">PENDIENTE COBRO</p><p className="text-[28px] font-extrabold mt-1">$120.000</p><p className="text-[12px] text-[#EF4444]">3 boletas</p></div>
          <div className="bg-white rounded-[20px] p-6 border shadow-sm"><p className="text-[12px] font-bold tracking-widest text-[#6b7280]">TICKET PROMEDIO</p><p className="text-[28px] font-extrabold mt-1">$32.500</p><p className="text-[12px] text-[#6b7280]">18 atenciones</p></div>
        </div>
        <div className="bg-white rounded-[20px] border shadow-sm overflow-hidden">
          <div className="p-5 border-b flex justify-between items-center"><h3 className="font-bold">Pagos hoy</h3><span className="text-[12px] text-[#6b7280]">Transbank • Transferencia</span></div>
          <div className="divide-y">
            <div className="p-4 flex justify-between text-[14px]"><span><b>Milo</b> - Consulta</span><span>$25.000 • Transbank</span></div>
            <div className="p-4 flex justify-between text-[14px]"><span><b>Luna</b> - Vacuna</span><span>$28.000 • Transferencia</span></div>
            <div className="p-4 flex justify-between text-[14px]"><span><b>Thor</b> - Cirugía</span><span>$120.000 • Transbank</span></div>
          </div>
        </div>
        <button className="w-full mt-6 h-[60px] rounded-[24px] bg-[#0F172A] text-white font-bold text-[15px]">Cerrar caja • Generar SII</button>
      </div>
    </div>
  )
}
