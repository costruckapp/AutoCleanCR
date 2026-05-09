import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { crearEvento } from '../../../lib/googleCalendar'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()
    const { cita_id, ...eventoData } = body
    const evento = await crearEvento(eventoData)

    if (cita_id && evento?.id) {
      await supabaseAdmin
        .from('citas')
        .update({ google_event_id: evento.id })
        .eq('id', cita_id)
    }

    return NextResponse.json({ ok: true, evento })
  } catch (err) {
    console.error('Error creando evento:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
