'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

export default function LoginPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')

  async function resolverCorreo(valor) {
    const res = await fetch('/api/auth/resolver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: valor,
      }),
    })

    return await res.json()
  }

  async function iniciarSesion(e) {
    e.preventDefault()

    setLoading(true)
    setMensaje('')

    const resolved = await resolverCorreo(usuario)

    if (resolved.error) {
      setMensaje(resolved.error)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: resolved.correo,
      password,
    })

    if (error) {
      setMensaje(`No se pudo ingresar: ${error.message}`)
      setLoading(false)
      return
    }

    const { data: perfil, error: perfilError } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (perfilError || !perfil) {
      setMensaje('Perfil no encontrado. Contacte al administrador.')
      setLoading(false)
      return
    }

    if (perfil.activo === false) {
      setMensaje('Este usuario está bloqueado. Contacte al administrador.')
      setLoading(false)
      return
    }

    if (perfil.rol === 'admin') {
      router.push('/admin')
      return
    }

    if (perfil.rol === 'colaborador') {
      router.push('/colaborador')
      return
    }

    router.push('/cliente')
  }

  return (
    <main className="login-page">
      <div className="login-box">
        <img src="/logo-png.png" alt="AutoClean CR" className="logo" />

        <h1>INGRESAR</h1>

        <p className="sub">
          Portal AutoClean CR
        </p>

        <form onSubmit={iniciarSesion}>
          <input
            type="text"
            placeholder="Correo, usuario o WhatsApp"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        {mensaje && (
          <div className="mensaje">
            {mensaje}
          </div>
        )}

        <div className="extra">
          ¿No tienes cuenta?
        </div>

        <a href="/registro" className="registro-btn">
          Crear cuenta de cliente
        </a>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: #080808;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .login-box {
          width: 100%;
          max-width: 420px;
          background: #111;
          border: 1px solid #222;
          border-radius: 18px;
          padding: 40px;
        }

        .logo {
          height: 80px;
          object-fit: contain;
          margin: 0 auto 20px;
          display: block;
        }

        h1 {
          color: white;
          text-align: center;
          font-size: 38px;
          margin-bottom: 8px;
        }

        .sub {
          color: #666;
          text-align: center;
          margin-bottom: 30px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        input {
          background: #1a1a1a;
          border: 1px solid #333;
          padding: 16px;
          border-radius: 10px;
          color: white;
          font-size: 15px;
        }

        button {
          background: #4FC3F7;
          border: none;
          color: black;
          padding: 16px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
          font-size: 15px;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .mensaje {
          background: #2a1010;
          color: #ff8080;
          padding: 14px;
          border-radius: 10px;
          margin-top: 20px;
          text-align: center;
        }

        .extra {
          color: #666;
          text-align: center;
          margin-top: 30px;
          margin-bottom: 14px;
        }

        .registro-btn {
          display: block;
          text-align: center;
          padding: 14px;
          border: 1px solid #333;
          border-radius: 10px;
          color: white;
          text-decoration: none;
        }
      `}</style>
    </main>
  )
}