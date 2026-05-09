import { NextResponse } from 'next/server'
import { crearEvento } from '../../../lib/googleCalendar'

export async function POST(req) {
  try {
    const body = await req.json()
    const evento = await crearEvento(body)
    return NextResponse.json({ ok: true, evento })
  } catch (err) {
    console.error('Error creando evento:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
