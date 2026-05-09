import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const { data: userData, error: userError } = await adminSupabase.auth.admin.getUserById(id)
    if (userError) throw userError

    const email = userData.user?.email
    if (!email) throw new Error('No se encontró el correo del usuario')

    if (email.endsWith('@autocleancr.local')) {
      throw new Error('Los colaboradores no usan correo real. Cambiá la clave directamente desde el admin.')
    }

    const { error } = await adminSupabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login`,
    })
    if (error) throw error

    return NextResponse.json({ ok: true, email })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
