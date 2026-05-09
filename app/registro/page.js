'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const provinciasCR = {
  'San José': ['Central', 'Escazú', 'Desamparados', 'Puriscal', 'Tarrazú', 'Aserrí', 'Mora', 'Goicoechea', 'Santa Ana', 'Alajuelita', 'Vásquez de Coronado', 'Acosta', 'Tibás', 'Moravia', 'Montes de Oca', 'Turrubares', 'Dota', 'Curridabat', 'Pérez Zeledón', 'León Cortés'],
  'Alajuela': ['Central', 'San Ramón', 'Grecia', 'San Mateo', 'Atenas', 'Naranjo', 'Palmares', 'Poás', 'Orotina', 'San Carlos'],
  'Cartago': ['Central', 'Paraíso', 'La Unión', 'Jiménez', 'Turrialba', 'Alvarado', 'Oreamuno', 'El Guarco'],
  'Heredia': ['Central', 'Barva', 'Santo Domingo', 'Santa Bárbara', 'San Rafael', 'San Isidro', 'Belén', 'Flores'],
}

export default function RegistroPage() {
  const router = useRouter()

  const [nombre, setNombre] = useState('')
  const [telefono, setTelefono] = useState('')
  const [correo, setCorreo] = useState('')
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] = useState('')

  const [provincia, setProvincia] = useState('')
  const [canton, setCanton] = useState('')
  const [distrito, setDistrito] = useState('')
  const [direccionDetallada, setDireccionDetallada] = useState('')
  const [referencia, setReferencia] = useState('')
  const [domicilio, setDomicilio] = useState(false)

  const [loading, setLoading] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [tipoMensaje, setTipoMensaje] = useState('')

  async function registrarCliente(e) {
    e.preventDefault()

    setMensaje('')
    setTipoMensaje('')

    if (password !== confirmarPassword) {
      setMensaje('Las contraseñas no coinciden.')
      setTipoMensaje('error')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/cliente/registrar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          telefono,
          correo,
          password,
          provincia,
          canton,
          distrito,
          direccionDetallada,
          referencia,
          domicilio,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        setMensaje(data.error || 'No se pudo crear la cuenta.')
        setTipoMensaje('error')
        setLoading(false)
        return
      }

      setMensaje('Cuenta creada correctamente.')

      setTipoMensaje('success')

      setTimeout(() => {
        router.push('/login')
      }, 1800)
    } catch (error) {
      setMensaje(`Error: ${error.message}`)
      setTipoMensaje('error')
    }

    setLoading(false)
  }

  return (
    <main className="page">
      <div className="box">
        <img src="/logo-png.png" alt="AutoClean CR" className="logo" />

        <h1>Crear cuenta</h1>

        <p className="sub">
          Registro de clientes AutoClean CR
        </p>

        <form onSubmit={registrarCliente}>
          <input
            type="text"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <input
            type="tel"
            placeholder="WhatsApp"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />

          <select
            value={provincia}
            onChange={(e) => {
              setProvincia(e.target.value)
              setCanton('')
            }}
            required
          >
            <option value="">
              Provincia
            </option>

            {Object.keys(provinciasCR).map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>

          <select
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            required
          >
            <option value="">
              Cantón
            </option>

            {provincia &&
              provinciasCR[provincia].map((cant) => (
                <option key={cant} value={cant}>
                  {cant}
                </option>
              ))}
          </select>

          <input
            type="text"
            placeholder="Distrito"
            value={distrito}
            onChange={(e) => setDistrito(e.target.value)}
            required
          />

          <textarea
            placeholder="Dirección exacta"
            value={direccionDetallada}
            onChange={(e) => setDireccionDetallada(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Referencia / punto conocido"
            value={referencia}
            onChange={(e) => setReferencia(e.target.value)}
          />

          <label className="checkbox">
            <input
              type="checkbox"
              checked={domicilio}
              onChange={(e) => setDomicilio(e.target.checked)}
            />

            Deseo servicio a domicilio
          </label>

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        {mensaje && (
          <div className={`mensaje ${tipoMensaje}`}>
            {mensaje}
          </div>
        )}

        <a href="/login" className="volver">
          Ya tengo cuenta
        </a>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #080808;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .box {
          width: 100%;
          max-width: 520px;
          background: #111;
          border: 1px solid #222;
          border-radius: 22px;
          padding: 40px;
        }

        .logo {
          height: 80px;
          display: block;
          margin: 0 auto 20px;
        }

        h1 {
          color: white;
          text-align: center;
          font-size: 38px;
          margin-bottom: 8px;
        }

        .sub {
          text-align: center;
          color: #777;
          margin-bottom: 30px;
        }

        form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        input,
        select,
        textarea {
          background: #1a1a1a;
          border: 1px solid #333;
          color: white;
          padding: 16px;
          border-radius: 12px;
          font-size: 15px;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        button {
          background: #4FC3F7;
          border: none;
          color: black;
          padding: 16px;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
          font-size: 15px;
        }

        button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .mensaje {
          margin-top: 20px;
          padding: 14px;
          border-radius: 10px;
          text-align: center;
        }

        .success {
          background: #0f1f13;
          color: #76ff91;
        }

        .error {
          background: #2a1010;
          color: #ff8080;
        }

        .volver {
          display: block;
          margin-top: 20px;
          text-align: center;
          color: white;
          text-decoration: none;
          border: 1px solid #333;
          padding: 14px;
          border-radius: 10px;
        }

        .checkbox {
          display: flex;
          align-items: center;
          gap: 10px;
          color: white;
          font-size: 14px;
        }

        .checkbox input {
          width: auto;
        }
      `}</style>
    </main>
  )
}