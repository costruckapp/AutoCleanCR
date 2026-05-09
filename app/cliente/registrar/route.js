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
    const body = await req.json()

    const { nombre, telefono, correo, password } = body

    if (!nombre || !telefono || !correo || !password) {
      return Response.json({ error: 'Faltan datos obligatorios.' }, { status: 400 })
    }

    const telefonoLimpio = limpiarTelefono(telefono)
    const correoLimpio = correo.trim().toLowerCase()

    if (telefonoLimpio.length < 8) {
      return Response.json({ error: 'Ingresá un número de WhatsApp válido.' }, { status: 400 })
    }

    const { data: existeTelefono } = await adminSupabase
      .from('perfiles')
      .select('id')
      .eq('telefono', telefonoLimpio)
      .maybeSingle()

    if (existeTelefono) {
      return Response.json({ error: 'Ya existe una cuenta con ese WhatsApp.' }, { status: 400 })
    }

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: correoLimpio,
      password,
      email_confirm: true,
    })

    if (error) {
      return Response.json({ error: error.message }, { status: 400 })
    }

    const { error: perfilError } = await adminSupabase
      .from('perfiles')
      .update({
        nombre,
        telefono: telefonoLimpio,
        correo: correoLimpio,
        rol: 'cliente',
        activo: true,
      })
      .eq('id', data.user.id)

    if (perfilError) {
      return Response.json({ error: perfilError.message }, { status: 400 })
    }

    return Response.json({ ok: true })
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 })
  }
}