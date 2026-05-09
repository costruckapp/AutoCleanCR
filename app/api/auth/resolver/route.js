import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

function limpiarTelefono(valor) {
  return String(valor || '').replace(/\D/g, '')
}

export async function POST(req) {
  try {
    const { usuario } = await req.json()

    const limpio = String(usuario || '').trim().toLowerCase()

    if (!limpio) {
      return Response.json(
        { error: 'Ingrese correo, usuario o WhatsApp.' },
        { status: 400 }
      )
    }

    if (limpio === 'chruga86') {
      return Response.json({
        correo: 'chruga86@gmail.com',
      })
    }

    if (limpio.includes('@')) {
      return Response.json({
        correo: limpio,
      })
    }

    const telefono = limpiarTelefono(limpio)

    if (telefono.length >= 8) {
      const { data, error } = await adminSupabase
        .from('perfiles')
        .select('correo')
        .eq('telefono', telefono)
        .maybeSingle()

      if (error || !data?.correo) {
        return Response.json(
          { error: 'No existe una cuenta registrada con ese WhatsApp.' },
          { status: 404 }
        )
      }

      return Response.json({
        correo: data.correo,
      })
    }

    return Response.json({
      correo: `${limpio}@autocleancr.local`,
    })
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}