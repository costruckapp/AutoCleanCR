import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req, { params }) {
  try {
    const { id } = await params
    const { data: boleta, error } = await supabaseAdmin
      .from('boletas')
      .select(`
        *,
        cita:citas (
          id, fecha, hora, provincia, canton, distrito, direccion_detallada, notas, estado, cliente_id,
          vehiculo:vehiculos (marca, modelo, placa, color, anio, tiene_ppf, tiene_ceramico, tiene_wrap),
          cita_servicios (duracion_minutos, precio, servicio:servicios (nombre))
        ),
        fotos:boleta_fotos (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (boleta.cita?.cliente_id) {
      const { data: perfil } = await supabaseAdmin
        .from('perfiles')
        .select('nombre, telefono, email')
        .eq('id', boleta.cita.cliente_id)
        .single()
      boleta.perfil = perfil || null
    }

    return NextResponse.json({ boleta })
  } catch (err) {
    console.error('GET /api/boletas/[id]:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const updates = await req.json()

    const { data, error } = await supabaseAdmin
      .from('boletas')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, cita:citas(vehiculo_id)')
      .single()

    if (error) throw error

    // Sync protection changes back to the vehicle profile
    const protFields = ['tiene_ceramico', 'tiene_ppf', 'tiene_wrap']
    const hasProtUpdate = protFields.some(f => f in updates)
    if (hasProtUpdate && data.cita?.vehiculo_id) {
      const vehUpdate = {}
      if ('tiene_ceramico' in updates) vehUpdate.tiene_ceramico = updates.tiene_ceramico
      if ('tiene_ppf'      in updates) vehUpdate.tiene_ppf      = updates.tiene_ppf
      if ('tiene_wrap'     in updates) vehUpdate.tiene_wrap      = updates.tiene_wrap
      await supabaseAdmin.from('vehiculos').update(vehUpdate).eq('id', data.cita.vehiculo_id)
    }

    // Notificar a N8N cuando el servicio se marca completado
    if (updates.estado === 'completado') {
      try {
        const n8nCompletadoUrl = process.env.N8N_SERVICIO_COMPLETADO
        if (n8nCompletadoUrl) {
          const { data: citaCompleta } = await supabaseAdmin
            .from('citas')
            .select(`
              id, fecha, hora, cliente_id,
              vehiculo:vehiculos (marca, modelo, placa),
              cita_servicios (servicio:servicios (nombre))
            `)
            .eq('id', data.cita_id)
            .single()

          let perfilCliente = null
          if (citaCompleta?.cliente_id) {
            const { data: p } = await supabaseAdmin
              .from('perfiles')
              .select('nombre, telefono, email')
              .eq('id', citaCompleta.cliente_id)
              .single()
            perfilCliente = p
          }

          await fetch(n8nCompletadoUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              boleta_id: id,
              cita_id: data.cita_id,
              cliente_nombre: perfilCliente?.nombre || '',
              cliente_telefono: perfilCliente?.telefono || '',
              cliente_email: perfilCliente?.email || '',
              fecha: citaCompleta?.fecha || '',
              hora: citaCompleta?.hora || '',
              servicios: citaCompleta?.cita_servicios?.map((cs) => cs.servicio?.nombre).filter(Boolean).join(', ') || '',
              vehiculo: citaCompleta?.vehiculo
                ? `${citaCompleta.vehiculo.marca} ${citaCompleta.vehiculo.modelo} (${citaCompleta.vehiculo.placa})`
                : '',
            }),
          })
        }
      } catch (e) {
        console.error('Error notificando a N8N (servicio completado):', e.message)
      }
    }

    return NextResponse.json({ boleta: data })
  } catch (err) {
    console.error('PATCH /api/boletas/[id]:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    await supabaseAdmin.from('boleta_fotos').delete().eq('boleta_id', id)
    const { error } = await supabaseAdmin.from('boletas').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
