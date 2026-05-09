import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const fecha = url.searchParams.get('fecha')

    let query = supabaseAdmin
      .from('citas')
      .select(`
        id, fecha, hora, estado, modalidad, provincia, canton, distrito,
        direccion_detallada, notas, cliente_id,
        vehiculo:vehiculos (marca, modelo, placa, color, anio),
        cita_servicios (duracion_minutos, precio, servicio:servicios (nombre))
      `)
      .order('fecha', { ascending: false })
      .order('hora', { ascending: true })

    if (fecha) query = query.eq('fecha', fecha)

    const { data, error } = await query
    if (error) throw error

    const clienteIds = [...new Set((data || []).map(c => c.cliente_id).filter(Boolean))]
    let perfiles = []
    if (clienteIds.length > 0) {
      const { data: p } = await supabaseAdmin
        .from('perfiles')
        .select('id, nombre, telefono')
        .in('id', clienteIds)
      perfiles = p || []
    }

    const citas = (data || []).map(c => ({
      ...c,
      perfil: perfiles.find(p => p.id === c.cliente_id) || null,
    }))

    return NextResponse.json({ citas })
  } catch (err) {
    console.error('GET /api/citas:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
