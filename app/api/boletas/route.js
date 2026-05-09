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

    const { data, error } = await supabaseAdmin
      .from('boletas')
      .select(`
        id, numero, estado, tipo_pago, created_at,
        hora_llegada, hora_inicio_trabajo, hora_termino_trabajo, hora_pago, notas_retraso,
        cita:citas (
          id, fecha, hora, provincia, canton, distrito, cliente_id,
          vehiculo:vehiculos (marca, modelo, placa)
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    const clienteIds = [...new Set((data || []).map(b => b.cita?.cliente_id).filter(Boolean))]
    let perfiles = []
    if (clienteIds.length > 0) {
      const { data: p } = await supabaseAdmin
        .from('perfiles')
        .select('id, nombre, telefono')
        .in('id', clienteIds)
      perfiles = p || []
    }

    let boletas = (data || []).map(b => ({
      ...b,
      perfil: perfiles.find(p => p.id === b.cita?.cliente_id) || null,
    }))

    if (fecha) {
      boletas = boletas.filter(b => b.cita?.fecha === fecha)
    }

    return NextResponse.json({ boletas })
  } catch (err) {
    console.error('GET /api/boletas:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { cita_id } = await req.json()

    const { count } = await supabaseAdmin
      .from('boletas')
      .select('*', { count: 'exact', head: true })

    const numero = `AC-${String((count || 0) + 1).padStart(3, '0')}`

    // Copy protection flags from the vehicle associated to this cita
    let vehiculoProt = {}
    if (cita_id) {
      const { data: cita } = await supabaseAdmin
        .from('citas')
        .select('vehiculo_id')
        .eq('id', cita_id)
        .single()
      if (cita?.vehiculo_id) {
        const { data: veh } = await supabaseAdmin
          .from('vehiculos')
          .select('tiene_ceramico, tiene_ppf, tiene_wrap')
          .eq('id', cita.vehiculo_id)
          .single()
        if (veh) vehiculoProt = {
          tiene_ceramico: veh.tiene_ceramico ?? false,
          tiene_ppf:      veh.tiene_ppf      ?? false,
          tiene_wrap:     veh.tiene_wrap      ?? false,
        }
      }
    }

    const { data, error } = await supabaseAdmin
      .from('boletas')
      .insert([{ numero, cita_id, estado: 'pendiente', ...vehiculoProt }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ boleta: data })
  } catch (err) {
    console.error('POST /api/boletas:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
