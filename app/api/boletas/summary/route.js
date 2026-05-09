import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET(req) {
  try {
    const url = new URL(req.url)
    const idsParam = url.searchParams.get('cita_ids')
    if (!idsParam) return NextResponse.json({ boletas: [] })

    const ids = idsParam.split(',').filter(Boolean)
    if (ids.length === 0) return NextResponse.json({ boletas: [] })

    const { data, error } = await supabaseAdmin
      .from('boletas')
      .select('cita_id, numero, estado, tiene_ceramico, tiene_ppf, tiene_wrap, acabado_interno, aroma, notas_colaborador, firma_inicio')
      .in('cita_id', ids)

    if (error) throw error
    return NextResponse.json({ boletas: data || [] })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
