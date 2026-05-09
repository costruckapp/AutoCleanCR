import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getEventosDelDia } from '../../../lib/googleCalendar'
import { geocodificar } from '../../../lib/geocoding'
import { tiempoDeViaje } from '../../../lib/routing'
import { calcularDescansos } from '../../../lib/descansos'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const HORARIO_INICIO = 7 * 60   // 7:00
const HORARIO_FIN   = 18 * 60   // 18:00
const INTERVALO     = 30
const BUFFER        = 15        // minutos extra de margen

export async function POST(req) {
  try {
    const { fecha, provincia, canton, direccion, duracion } = await req.json()

    if (!fecha) return NextResponse.json({ error: 'Fecha requerida' }, { status: 400 })

    const duracionServicio = duracion || 60

    // Geocodificar la ubicación de la nueva cita
    let coordsNueva = null
    if (canton && provincia) {
      coordsNueva = await geocodificar(direccion || '', canton, provincia)
    }

    // Citas del día en Supabase
    const { data: citasDelDia } = await supabaseAdmin
      .from('citas')
      .select('hora, provincia, canton, direccion_detallada, cita_servicios(duracion_minutos)')
      .eq('fecha', fecha)
      .neq('estado', 'cancelada')
      .order('hora', { ascending: true })

    // Eventos del día en Google Calendar
    let eventosCalendario = []
    try {
      eventosCalendario = await getEventosDelDia(fecha)
    } catch (e) {
      console.error('Google Calendar no disponible:', e.message)
    }

    // Construir bloques ocupados
    const bloques = []

    for (const cita of (citasDelDia || [])) {
      const [h, m] = cita.hora.split(':').map(Number)
      const inicioMin = h * 60 + m
      const durCita = cita.cita_servicios?.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0) || 90

      let viaje = 30
      if (coordsNueva && cita.canton && cita.provincia) {
        const coordsCita = await geocodificar(cita.direccion_detallada || '', cita.canton, cita.provincia)
        if (coordsCita) {
          viaje = await tiempoDeViaje(coordsCita, coordsNueva)
        }
      }

      bloques.push({
        inicio: inicioMin - viaje - BUFFER,
        fin: inicioMin + durCita + viaje + BUFFER,
      })
    }

    for (const evento of eventosCalendario) {
      if (!evento.start?.dateTime) continue
      const i = new Date(evento.start.dateTime)
      const f = new Date(evento.end?.dateTime || evento.start.dateTime)
      bloques.push({
        inicio: i.getHours() * 60 + i.getMinutes(),
        fin:    f.getHours() * 60 + f.getMinutes(),
      })
    }

    // Block out scheduled break times
    const citasParaDescanso = (citasDelDia || []).map(c => {
      const [h, m] = c.hora.split(':').map(Number)
      const inicioMin = h * 60 + m
      const dur = c.cita_servicios?.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0) || 90
      return { inicioMin, finMin: inicioMin + dur }
    })
    for (const d of calcularDescansos(citasParaDescanso, fecha)) {
      if (d.inicio !== null) bloques.push({ inicio: d.inicio, fin: d.fin })
    }

    // Generar slots
    const slots = []
    for (let min = HORARIO_INICIO; min <= HORARIO_FIN - duracionServicio; min += INTERVALO) {
      const finSlot = min + duracionServicio
      const ocupado = bloques.some((b) => min < b.fin && finSlot > b.inicio)
      const hh = String(Math.floor(min / 60)).padStart(2, '0')
      const mm = String(min % 60).padStart(2, '0')
      slots.push({ hora: `${hh}:${mm}`, disponible: !ocupado })
    }

    return NextResponse.json({ slots })
  } catch (err) {
    console.error('Error disponibilidad:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
