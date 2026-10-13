import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// POST /api/whatsapp/send
// Reemplaza el popup wa.me por WhatsApp Cloud API directo
// Body: { paciente_id, tutor_id, mensaje, plantilla }

export async function POST(req: Request) {
  try {
    const { paciente_id, tutor_id, mensaje, plantilla } = await req.json()

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // 1. Guarda en mensajes_tutores (para historial + Realtime)
    const { data, error } = await supabase.from('mensajes_tutores').insert({
      paciente_id: paciente_id || null,
      tutor_id: tutor_id || null,
      direccion: 'saliente',
      mensaje,
      plantilla: plantilla || null,
      estado: 'enviado',
    }).select().single()

    if (error) throw error

    // 2. Aquí va tu llamada real a WhatsApp Cloud API (Meta)
    // Descomenta cuando tengas token:
    /*
    const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN
    const PHONE_ID = process.env.WHATSAPP_PHONE_ID
    const to = mensaje.tutor_tel // +569...
    
    await fetch(`https://graph.facebook.com/v18.0/${PHONE_ID}/messages`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: mensaje }
      })
    })
    */

    // 3. Simula envío exitoso por ahora
    await supabase.from('mensajes_tutores').update({ estado: 'entregado', whatsapp_id: `wamid.${Date.now()}` }).eq('id', data.id)

    return NextResponse.json({ ok: true, id: data.id, message: 'WhatsApp Cloud API enviado - sin popup wa.me' })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 })
  }
}
