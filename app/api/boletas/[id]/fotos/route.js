import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req, { params }) {
  try {
    const { id } = await params
    const formData = await req.formData()
    const file = formData.get('file')
    const tipo = formData.get('tipo')

    if (!file) return NextResponse.json({ error: 'No se recibió archivo' }, { status: 400 })

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()
    const fileName = `${id}/${tipo}/${Date.now()}.${ext}`

    const { error: uploadError } = await supabaseAdmin.storage
      .from('boleta-fotos')
      .upload(fileName, buffer, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('boleta-fotos')
      .getPublicUrl(fileName)

    const { data, error } = await supabaseAdmin
      .from('boleta_fotos')
      .insert([{ boleta_id: id, tipo, url: publicUrl, nombre: file.name }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ foto: data })
  } catch (err) {
    console.error('POST /api/boletas/[id]/fotos:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
