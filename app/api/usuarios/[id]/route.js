import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function PATCH(req, { params }) {
  try {
    const { id } = await params
    const { nuevo_usuario, nueva_clave, ...perfilUpdates } = await req.json()

    if (nuevo_usuario) {
      const nuevoEmail = `${nuevo_usuario.trim().toLowerCase()}@autocleancr.local`
      const { error: authError } = await adminSupabase.auth.admin.updateUserById(id, { email: nuevoEmail })
      if (authError) throw authError
      perfilUpdates.correo = nuevoEmail
    }

    if (nueva_clave) {
      const { error: claveError } = await adminSupabase.auth.admin.updateUserById(id, { password: nueva_clave })
      if (claveError) throw claveError
    }

    if (Object.keys(perfilUpdates).length > 0) {
      const { error } = await adminSupabase.from('perfiles').update(perfilUpdates).eq('id', id)
      if (error) throw error
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = await params
    const { error } = await adminSupabase.auth.admin.deleteUser(id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
