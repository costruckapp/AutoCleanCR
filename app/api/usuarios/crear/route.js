import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  try {
    const body = await req.json()

    const {
      nombre,
      usuario,
      password,
      rol,
      notas,
    } = body

    if (!nombre || !usuario || !password || !rol) {
      return Response.json({
        error: 'Faltan datos obligatorios.',
      })
    }

    const usuarioLimpio = usuario.trim().toLowerCase()

    const correoInterno = `${usuarioLimpio}@autocleancr.local`

    const { data, error } = await adminSupabase.auth.admin.createUser({
      email: correoInterno,
      password,
      email_confirm: true,
    })

    if (error) {
      return Response.json({
        error: error.message,
      })
    }

    const { error: perfilError } = await adminSupabase
      .from('perfiles')
      .update({
        nombre,
        correo: correoInterno,
        rol,
        notas_admin: notas || '',
        activo: true,
      })
      .eq('id', data.user.id)

    if (perfilError) {
      return Response.json({
        error: perfilError.message,
      })
    }

    return Response.json({
      ok: true,
    })
  } catch (err) {
    return Response.json({
      error: err.message,
    })
  }
}