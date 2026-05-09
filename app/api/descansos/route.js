import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { calcularDescansos, minToHora } from '../../../lib/descansos'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const fecha = url.searchParams.get('fecha')
    if (!fecha) return NextResponse.json({ error: 'fecha requerida' }, { status: 400 })

    const { data: citas } = await supabaseAdmin
      .from('citas')
      .select('hora, cita_servicios(duracion_minutos)')
      .eq('fecha', fecha)
      .neq('estado', 'cancelada')
      .order('hora', { ascending: true })

    const citasOcupadas = (citas || []).map(c => {
      const [h, m] = c.hora.split(':').map(Number)
      const inicioMin = h * 60 + m
      const dur = c.cita_servicios?.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0) || 90
      return { inicioMin, finMin: inicioMin + dur }
    })

    const descansos = calcularDescansos(citasOcupadas, fecha).map(d => ({
      ...d,
      horaInicio: minToHora(d.inicio),
      horaFin:    minToHora(d.fin),
    }))

    return NextResponse.json({ descansos })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
