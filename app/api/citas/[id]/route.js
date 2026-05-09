import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { eliminarEvento, actualizarEvento } from '../../../../lib/googleCalendar'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const updates = await req.json()

    const { data, error } = await supabaseAdmin
      .from('citas')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        vehiculo:vehiculos (marca, modelo, placa),
        cita_servicios (duracion_minutos)
      `)
      .single()

    if (error) throw error

    // Sincronizar con Google Calendar si cambió fecha u hora
    if (data.google_event_id && (updates.fecha || updates.hora)) {
      try {
        const duracion = data.cita_servicios?.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0) || 60
        await actualizarEvento(data.google_event_id, {
          titulo: `AutoClean · ${data.vehiculo?.marca || ''} ${data.vehiculo?.modelo || ''} (${data.vehiculo?.placa || ''})`,
          fecha: data.fecha,
          hora: data.hora?.slice(0, 5),
          duracionMinutos: duracion,
          descripcion: `Notas: ${data.notas || ''}`,
          ubicacion: `${data.distrito || ''}, ${data.canton || ''}, ${data.provincia || ''}, Costa Rica`,
        })
      } catch (e) {
        console.error('Error actualizando evento de Calendar:', e.message)
      }
    }

    return NextResponse.json({ cita: data })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params

    // Obtener el google_event_id antes de borrar
    const { data: cita } = await supabaseAdmin
      .from('citas')
      .select('google_event_id')
      .eq('id', id)
      .single()

    // Eliminar de Google Calendar si existe el evento
    if (cita?.google_event_id) {
      try {
        await eliminarEvento(cita.google_event_id)
      } catch (e) {
        console.error('Error eliminando evento de Calendar:', e.message)
      }
    }

    await supabaseAdmin.from('cita_servicios').delete().eq('cita_id', id)
    const { error } = await supabaseAdmin.from('citas').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
