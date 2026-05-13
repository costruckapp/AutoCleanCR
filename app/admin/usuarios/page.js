'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function UsuariosAdmin() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)

  const [nombre, setNombre] = useState('')
  const [usuario, setUsuario] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState('colaborador')
  const [notas, setNotas] = useState('')
  const [guardando, setGuardando] = useState(false)

  const [editando, setEditando] = useState(null)
  const [editNombre, setEditNombre] = useState('')
  const [editUsuario, setEditUsuario] = useState('')
  const [editPassword, setEditPassword] = useState('')
  const [editRol, setEditRol] = useState('colaborador')
  const [editNotas, setEditNotas] = useState('')
  const [guardandoEdit, setGuardandoEdit] = useState(false)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  async function cargarUsuarios() {
    setLoading(true)

    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (!error) {
      setUsuarios(data || [])
    }

    setLoading(false)
  }

  async function crearColaborador() {
    if (!nombre || !usuario || !password) {
      alert('Completá nombre, usuario y contraseña.')
      return
    }

    setGuardando(true)

    const res = await fetch('/api/usuarios/crear', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre,
        usuario,
        password,
        rol,
        notas,
      }),
    })

    const data = await res.json()

    setGuardando(false)

    if (data.error) {
      alert(data.error)
      return
    }

    alert('Usuario creado correctamente')

    setMostrarModal(false)
    setNombre('')
    setUsuario('')
    setPassword('')
    setRol('colaborador')
    setNotas('')

    cargarUsuarios()
  }

  function abrirEditar(u) {
    setEditando(u)
    setEditNombre(u.nombre || '')
    setEditUsuario(u.correo?.replace('@autocleancr.local', '') || '')
    setEditPassword('')
    setEditRol(u.rol || 'colaborador')
    setEditNotas(u.notas_admin || '')
  }

  async function guardarEdicion() {
    if (!editNombre) { alert('El nombre es obligatorio.'); return }
    setGuardandoEdit(true)
    const body = {
      nombre: editNombre,
      nuevo_usuario: editUsuario,
      rol: editRol,
      notas_admin: editNotas,
    }
    if (editPassword) body.nueva_clave = editPassword
    const res = await fetch(`/api/usuarios/${editando.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setGuardandoEdit(false)
    if (data.error) { alert(data.error); return }
    setEditando(null)
    cargarUsuarios()
  }

  async function bloquearUsuario(id, estadoActual) {
    await supabase
      .from('perfiles')
      .update({
        activo: !estadoActual,
      })
      .eq('id', id)

    cargarUsuarios()
  }

  return (
    <main className="page">
      <div className="top">
        <div>
          <h1>Usuarios del Sistema</h1>

          <p>
            Gestión de clientes, colaboradores y administradores.
          </p>
        </div>

        <button
          className="crear-btn"
          onClick={() => setMostrarModal(true)}
        >
          + Crear colaborador
        </button>
      </div>

      <div className="tabla">
        <div className="header">
          <div>Nombre</div>
          <div>Correo / Usuario</div>
          <div>Rol</div>
          <div>Estado</div>
          <div>Acciones</div>
        </div>

        {loading ? (
          <div className="loading">
            Cargando usuarios...
          </div>
        ) : (
          usuarios.map((usuarioItem) => (
            <div className="fila" key={usuarioItem.id}>
              <div>
                {usuarioItem.nombre || 'Sin nombre'}
              </div>

              <div>
                {usuarioItem.correo}
              </div>

              <div>
                <span className={`rol ${usuarioItem.rol}`}>
                  {usuarioItem.rol}
                </span>
              </div>

              <div>
                <span
                  className={
                    usuarioItem.activo
                      ? 'estado activo'
                      : 'estado bloqueado'
                  }
                >
                  {usuarioItem.activo ? 'Activo' : 'Bloqueado'}
                </span>
              </div>

              <div className="acciones">
                <button
                  className="accion"
                  onClick={() => abrirEditar(usuarioItem)}
                >
                  Editar
                </button>

                <button
                  className="accion"
                  onClick={() =>
                    bloquearUsuario(
                      usuarioItem.id,
                      usuarioItem.activo
                    )
                  }
                >
                  {usuarioItem.activo ? 'Bloquear' : 'Activar'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {mostrarModal && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Crear colaborador</h2>

            <label>Nombre</label>
            <input
              placeholder="Ejemplo: Juan Pérez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />

            <label>Usuario</label>
            <input
              placeholder="Ejemplo: juan"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
            />

            <label>Contraseña</label>
            <input
              placeholder="Contraseña temporal"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <label>Rol</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
            >
              <option value="colaborador">
                Colaborador
              </option>

              <option value="admin">
                Administrador
              </option>
            </select>

            <label>Notas internas</label>
            <textarea
              placeholder="Comentarios visibles solo para administración"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
            />

            <div className="modal-actions">
              <button
                onClick={crearColaborador}
                disabled={guardando}
              >
                {guardando ? 'Creando...' : 'Crear usuario'}
              </button>

              <button
                className="cancelar"
                onClick={() => setMostrarModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {editando && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Editar usuario</h2>

            <label>Nombre</label>
            <input
              value={editNombre}
              onChange={(e) => setEditNombre(e.target.value)}
            />

            <label>Usuario</label>
            <input
              value={editUsuario}
              onChange={(e) => setEditUsuario(e.target.value)}
            />

            <label>Nueva contraseña (dejar vacío para no cambiar)</label>
            <input
              type="password"
              placeholder="Nueva contraseña"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
            />

            <label>Rol</label>
            <select value={editRol} onChange={(e) => setEditRol(e.target.value)}>
              <option value="colaborador">Colaborador</option>
              <option value="admin">Administrador</option>
            </select>

            <label>Notas internas</label>
            <textarea
              value={editNotas}
              onChange={(e) => setEditNotas(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={guardarEdicion} disabled={guardandoEdit}>
                {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className="cancelar" onClick={() => setEditando(null)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #080808;
          color: white;
          padding: 40px;
          font-family: Arial, sans-serif;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          gap: 20px;
        }

        h1 {
          font-size: 46px;
          margin-bottom: 10px;
        }

        p {
          color: #777;
        }

        .crear-btn {
          background: #4FC3F7;
          border: none;
          padding: 14px 22px;
          border-radius: 10px;
          font-weight: 800;
          cursor: pointer;
        }

        .tabla {
          background: #111;
          border: 1px solid #222;
          border-radius: 18px;
          overflow: hidden;
        }

        .header,
        .fila {
          display: grid;
          grid-template-columns: 1.3fr 1.6fr .8fr .8fr 1fr;
          gap: 20px;
          align-items: center;
          padding: 20px;
        }

        .header {
          background: #0f0f0f;
          border-bottom: 1px solid #222;
          font-weight: 800;
          color: #777;
        }

        .fila {
          border-bottom: 1px solid #1f1f1f;
        }

        .fila:last-child {
          border-bottom: none;
        }

        .rol {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          text-transform: uppercase;
        }

        .rol.admin {
          background: #4FC3F7;
          color: black;
        }

        .rol.cliente {
          background: #1f1f1f;
          color: #aaa;
        }

        .rol.colaborador {
          background: #2d1d00;
          color: #ffb84d;
        }

        .estado {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        .activo {
          background: #0d2a12;
          color: #6dff91;
        }

        .bloqueado {
          background: #2a1010;
          color: #ff8080;
        }

        .acciones {
          display: flex;
          gap: 10px;
        }

        .accion {
          background: #1f1f1f;
          border: 1px solid #333;
          color: white;
          padding: 10px 14px;
          border-radius: 10px;
          cursor: pointer;
        }

        .loading {
          padding: 40px;
          text-align: center;
          color: #777;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, .75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
        }

        .modal {
          background: #111;
          border: 1px solid #222;
          border-radius: 20px;
          padding: 30px;
          width: 100%;
          max-width: 500px;
        }

        .modal h2 {
          margin-bottom: 20px;
          font-size: 30px;
        }

        .modal label {
          display: block;
          color: #777;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .modal input,
        .modal select,
        .modal textarea {
          width: 100%;
          margin-bottom: 14px;
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 10px;
          padding: 14px;
          color: white;
          box-sizing: border-box;
        }

        .modal textarea {
          min-height: 120px;
          resize: vertical;
        }

        .modal-actions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }

        .modal-actions button {
          flex: 1;
          border: none;
          padding: 14px;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 800;
        }

        .modal-actions button:first-child {
          background: #4FC3F7;
          color: black;
        }

        .modal-actions button:disabled {
          opacity: .6;
          cursor: not-allowed;
        }

        .cancelar {
          background: #222 !important;
          color: white !important;
        }

        @media (max-width: 1000px) {
          .page {
            padding: 20px;
          }

          .top {
            flex-direction: column;
            align-items: flex-start;
          }

          .header {
            display: none;
          }

          .fila {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .acciones {
            width: 100%;
          }

          .accion {
            flex: 1;
          }
        }
      `}</style>
    </main>
  )
}