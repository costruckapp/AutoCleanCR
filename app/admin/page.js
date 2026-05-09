'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

const BADGE_BOLETA = {
  pendiente:  { label: 'Pendiente',   color: '#f59e0b' },
  en_proceso: { label: 'En proceso',  color: '#3b82f6' },
  completado: { label: 'Completado',  color: '#22c55e' },
}

function formatHora(iso) {
  if (!iso) return null
  return new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
}


export default function AdminPage() {
  const [perfil, setPerfil]           = useState(null)
  const [seccion, setSeccion]         = useState('dashboard')
  const [kpis, setKpis]               = useState({ clientes: 0, vehiculos: 0, citasHoy: 0, boletasHoy: 0 })
  const [boletas, setBoletas]         = useState([])
  const [usuarios, setUsuarios]       = useState([])
  const [cargando, setCargando]       = useState(true)
  const [cargandoUsuarios, setCargandoUsuarios] = useState(false)

  // Modal crear colaborador
  const [modalColaborador, setModalColaborador] = useState(false)
  const [nuevoNombre, setNuevoNombre]   = useState('')
  const [nuevoUsuario, setNuevoUsuario] = useState('')
  const [nuevoPassword, setNuevoPassword] = useState('')
  const [nuevoNotas, setNuevoNotas]     = useState('')
  const [creando, setCreando]           = useState(false)
  const [errorCrear, setErrorCrear]     = useState('')

  // Filtro usuarios
  const [filtroRol, setFiltroRol] = useState('todos')

  // Citas
  const [citas, setCitas]               = useState([])
  const [cargandoCitas, setCargandoCitas] = useState(false)
  const [citaEditando, setCitaEditando]  = useState(null)
  const [editCFecha, setEditCFecha]      = useState('')
  const [editCHora, setEditCHora]        = useState('')
  const [editCEstado, setEditCEstado]    = useState('')
  const [editCNotas, setEditCNotas]      = useState('')
  const [guardandoCita, setGuardandoCita] = useState(false)

  // Modal tiempos boleta
  const [boletaTiempos, setBoletaTiempos] = useState(null)

  // Modal editar usuario
  const [usuarioEditando, setUsuarioEditando] = useState(null)
  const [editNombre, setEditNombre]       = useState('')
  const [editTelefono, setEditTelefono]   = useState('')
  const [editNotas, setEditNotas]         = useState('')
  const [editUsuario, setEditUsuario]     = useState('')
  const [editClave, setEditClave]         = useState('')
  const [guardandoEdit, setGuardandoEdit] = useState(false)
  const [enviandoReset, setEnviandoReset] = useState(false)

  useEffect(() => { cargarTodo() }, [])

  async function cargarTodo() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }

    const hoy = new Date().toISOString().split('T')[0]

    const [{ data: p }, { count: cl }, { count: ve }, { count: ci }] = await Promise.all([
      supabase.from('perfiles').select('*').eq('id', user.id).single(),
      supabase.from('perfiles').select('*', { count: 'exact', head: true }).eq('rol', 'cliente'),
      supabase.from('vehiculos').select('*', { count: 'exact', head: true }),
      supabase.from('citas').select('*', { count: 'exact', head: true }).eq('fecha', hoy),
    ])

    setPerfil(p)
    setKpis(prev => ({ ...prev, clientes: cl || 0, vehiculos: ve || 0, citasHoy: ci || 0 }))

    const res = await fetch('/api/boletas')
    const json = await res.json()
    const todas = json.boletas || []
    setBoletas(todas)
    setKpis(prev => ({ ...prev, boletasHoy: todas.filter(b => b.cita?.fecha === hoy).length }))

    setCargando(false)
  }

  async function cargarUsuarios() {
    setCargandoUsuarios(true)
    const { data } = await supabase
      .from('perfiles')
      .select('id, nombre, correo, rol, activo, telefono, notas_admin, created_at')
      .order('created_at', { ascending: false })
    setUsuarios(data || [])
    setCargandoUsuarios(false)
  }

  useEffect(() => {
    if (seccion === 'usuarios') cargarUsuarios()
  }, [seccion])

  async function crearColaborador() {
    if (!nuevoNombre || !nuevoUsuario || !nuevoPassword) {
      setErrorCrear('Nombre, usuario y contraseña son obligatorios.')
      return
    }
    setCreando(true)
    setErrorCrear('')
    const res = await fetch('/api/usuarios/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nuevoNombre,
        usuario: nuevoUsuario,
        password: nuevoPassword,
        rol: 'colaborador',
        notas: nuevoNotas,
      }),
    })
    const json = await res.json()
    if (json.error) {
      setErrorCrear(json.error)
    } else {
      setModalColaborador(false)
      setNuevoNombre(''); setNuevoUsuario(''); setNuevoPassword(''); setNuevoNotas('')
      cargarUsuarios()
    }
    setCreando(false)
  }

  async function toggleBloqueo(usuario) {
    const nuevoEstado = !usuario.activo
    await fetch(`/api/usuarios/${usuario.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: nuevoEstado }),
    })
    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, activo: nuevoEstado } : u))
  }

  async function cambiarRol(usuario, nuevoRol) {
    await fetch(`/api/usuarios/${usuario.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rol: nuevoRol }),
    })
    setUsuarios(prev => prev.map(u => u.id === usuario.id ? { ...u, rol: nuevoRol } : u))
  }

  function esColaborador(u) {
    return u.correo?.endsWith('@autocleancr.local')
  }

  function abrirEditar(u) {
    setUsuarioEditando(u)
    setEditNombre(u.nombre || '')
    setEditTelefono(u.telefono || '')
    setEditNotas(u.notas_admin || '')
    setEditClave('')
    setEditUsuario(esColaborador(u) ? u.correo.replace('@autocleancr.local', '') : '')
  }

  async function guardarEdicion() {
    if (!usuarioEditando) return
    setGuardandoEdit(true)
    const body = { nombre: editNombre, telefono: editTelefono, notas_admin: editNotas }
    if (esColaborador(usuarioEditando) && editUsuario.trim()) body.nuevo_usuario = editUsuario.trim()
    if (esColaborador(usuarioEditando) && editClave.trim()) body.nueva_clave = editClave.trim()
    const res = await fetch(`/api/usuarios/${usuarioEditando.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const json = await res.json()
    if (json.error) { alert('Error: ' + json.error); setGuardandoEdit(false); return }
    const correoNuevo = esColaborador(usuarioEditando) && editUsuario.trim()
      ? `${editUsuario.trim().toLowerCase()}@autocleancr.local`
      : usuarioEditando.correo
    setUsuarios(prev => prev.map(u =>
      u.id === usuarioEditando.id
        ? { ...u, nombre: editNombre, telefono: editTelefono, notas_admin: editNotas, correo: correoNuevo }
        : u
    ))
    setUsuarioEditando(null)
    setGuardandoEdit(false)
  }

  async function enviarResetPassword(u) {
    if (!confirm(`Se enviará un email de recuperación a ${u.correo}. ¿Continuar?`)) return
    setEnviandoReset(true)
    const res = await fetch(`/api/usuarios/${u.id}/reset-password`, { method: 'POST' })
    const json = await res.json()
    if (json.error) alert('Error: ' + json.error)
    else alert(`Email de recuperación enviado a ${json.email}`)
    setEnviandoReset(false)
  }

  async function eliminarUsuario(u) {
    if (!confirm(`¿Eliminar a ${u.nombre || u.correo}? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/usuarios/${u.id}`, { method: 'DELETE' })
    setUsuarios(prev => prev.filter(x => x.id !== u.id))
  }

  // ── Citas ──────────────────────────────────────────────
  async function cargarCitas() {
    setCargandoCitas(true)
    const res = await fetch('/api/citas')
    const json = await res.json()
    setCitas(json.citas || [])
    setCargandoCitas(false)
  }

  useEffect(() => {
    if (seccion === 'citas' || seccion === 'citas-hoy') cargarCitas()
  }, [seccion])

  function abrirEditarCita(c) {
    setCitaEditando(c)
    setEditCFecha(c.fecha || '')
    setEditCHora(c.hora || '')
    setEditCEstado(c.estado || 'pendiente')
    setEditCNotas(c.notas || '')
  }

  async function guardarCitaAdmin() {
    if (!citaEditando) return
    setGuardandoCita(true)
    const res = await fetch(`/api/citas/${citaEditando.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fecha: editCFecha, hora: editCHora, estado: editCEstado, notas: editCNotas }),
    })
    const json = await res.json()
    if (json.error) { alert('Error: ' + json.error); setGuardandoCita(false); return }
    setCitas(prev => prev.map(c => c.id === citaEditando.id
      ? { ...c, fecha: editCFecha, hora: editCHora, estado: editCEstado, notas: editCNotas }
      : c
    ))
    setCitaEditando(null)
    setGuardandoCita(false)
  }

  async function eliminarCita(c) {
    if (!confirm(`¿Eliminar la cita de ${c.perfil?.nombre || 'este cliente'} el ${c.fecha}? También se eliminará la boleta asociada.`)) return
    await fetch(`/api/citas/${c.id}`, { method: 'DELETE' })
    setCitas(prev => prev.filter(x => x.id !== c.id))
    setBoletas(prev => prev.filter(b => b.cita?.id !== c.id))
  }

  async function eliminarTodasPendientes(citasFiltradas) {
    const pendientes = citasFiltradas.filter(c => c.estado === 'pendiente')
    if (pendientes.length === 0) { alert('No hay citas pendientes para eliminar.'); return }
    if (!confirm(`¿Eliminar ${pendientes.length} cita(s) pendiente(s)? Esta acción no se puede deshacer.`)) return
    await Promise.all(pendientes.map(c => fetch(`/api/citas/${c.id}`, { method: 'DELETE' })))
    const ids = new Set(pendientes.map(c => c.id))
    setCitas(prev => prev.filter(c => !ids.has(c.id)))
    setBoletas(prev => prev.filter(b => !ids.has(b.cita?.id)))
  }

  // ── Boletas ─────────────────────────────────────────────
  async function eliminarBoleta(b) {
    if (!confirm(`¿Eliminar la boleta ${b.numero}? Esta acción no se puede deshacer.`)) return
    await fetch(`/api/boletas/${b.id}`, { method: 'DELETE' })
    setBoletas(prev => prev.filter(x => x.id !== b.id))
  }

  async function cambiarEstadoBoleta(b, nuevoEstado) {
    await fetch(`/api/boletas/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado: nuevoEstado }),
    })
    setBoletas(prev => prev.map(x => x.id === b.id ? { ...x, estado: nuevoEstado } : x))
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const hoy = new Date().toISOString().split('T')[0]
  const boletasFiltradas = seccion === 'boletas-hoy'
    ? boletas.filter(b => b.cita?.fecha === hoy)
    : boletas

  const usuariosFiltrados = filtroRol === 'todos'
    ? usuarios
    : usuarios.filter(u => u.rol === filtroRol)

  return (
    <main className="admin-layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <img src="/logo-png.png" alt="AutoClean CR" className="logo" />
          <div className="role">ADMINISTRADOR</div>
        </div>

        <nav className="menu">
          {[
            { key: 'dashboard',    label: 'Dashboard' },
            { key: 'citas',        label: 'Todas las citas' },
            { key: 'citas-hoy',    label: 'Citas de hoy' },
            { key: 'boletas',      label: 'Todas las boletas' },
            { key: 'boletas-hoy',  label: 'Boletas de hoy' },
            { key: 'usuarios',     label: 'Usuarios' },
          ].map(({ key, label }) => (
            <button key={key} className={seccion === key ? 'activo' : ''} onClick={() => setSeccion(key)}>
              {label}
            </button>
          ))}
        </nav>

        <button onClick={cerrarSesion} className="logout">Cerrar sesión</button>
      </aside>

      {/* CONTENT */}
      <section className="content">
        <div className="topbar">
          <div>
            <h1>
              {seccion === 'dashboard'   ? 'Dashboard' :
               seccion === 'citas'       ? 'Todas las citas' :
               seccion === 'citas-hoy'   ? 'Citas de hoy' :
               seccion === 'boletas-hoy' ? 'Boletas de hoy' :
               seccion === 'boletas'     ? 'Todas las boletas' : 'Usuarios'}
            </h1>
            <p>Bienvenido{perfil?.nombre ? `, ${perfil.nombre}` : ''}</p>
          </div>
          {seccion === 'usuarios' && (
            <button className="btn-nuevo" onClick={() => { setModalColaborador(true); setErrorCrear('') }}>
              + Crear colaborador
            </button>
          )}
        </div>

        {/* KPIs */}
        <div className="cards">
          {[
            { label: 'Clientes',     val: kpis.clientes },
            { label: 'Vehículos',    val: kpis.vehiculos },
            { label: 'Citas hoy',    val: kpis.citasHoy },
            { label: 'Boletas hoy',  val: kpis.boletasHoy },
          ].map(({ label, val }) => (
            <div key={label} className="card">
              <div className="card-title">{label}</div>
              <div className="card-number">{val}</div>
            </div>
          ))}
        </div>

        {/* DASHBOARD */}
        {seccion === 'dashboard' && (
          <div className="panel">
            <h2>Resumen por estado</h2>
            <div className="estados-resumen">
              {['pendiente', 'en_proceso', 'completado'].map(estado => {
                const b = BADGE_BOLETA[estado]
                const count = boletas.filter(x => x.estado === estado).length
                return (
                  <div key={estado} className="estado-card" style={{ borderColor: b.color + '44' }}>
                    <div className="estado-numero" style={{ color: b.color }}>{count}</div>
                    <div className="estado-label">{b.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TABLA CITAS */}
        {(seccion === 'citas' || seccion === 'citas-hoy') && (() => {
          const hoyStr = new Date().toISOString().split('T')[0]
          const citasFiltradas = seccion === 'citas-hoy'
            ? citas.filter(c => c.fecha === hoyStr)
            : citas
          return (
            <div className="panel">
              {cargandoCitas ? (
                <p className="muted">Cargando citas...</p>
              ) : citasFiltradas.length === 0 ? (
                <p className="muted">No hay citas para mostrar.</p>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                    <button
                      className="btn-accion-tabla eliminar"
                      style={{ padding: '8px 16px', fontSize: '13px' }}
                      onClick={() => eliminarTodasPendientes(citasFiltradas)}
                    >
                      Eliminar todas las pendientes ({citasFiltradas.filter(c => c.estado === 'pendiente').length})
                    </button>
                  </div>
                  <div className="tabla-wrapper">
                  <table className="tabla">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>Hora</th>
                        <th>Cliente</th>
                        <th>Teléfono</th>
                        <th>Vehículo</th>
                        <th>Placa</th>
                        <th>Servicios</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasFiltradas.map(c => {
                        const serviciosNombres = (c.cita_servicios || []).map(cs => cs.servicio?.nombre).filter(Boolean).join(', ')
                        const estadoColors = { pendiente: '#f59e0b', confirmada: '#3b82f6', cancelada: '#ef4444', completada: '#22c55e' }
                        const color = estadoColors[c.estado] || '#777'
                        return (
                          <tr key={c.id}>
                            <td>{c.fecha}</td>
                            <td>{c.hora?.slice(0, 5)}</td>
                            <td>{c.perfil?.nombre || '—'}</td>
                            <td className="muted">{c.perfil?.telefono || '—'}</td>
                            <td>{c.vehiculo ? `${c.vehiculo.marca} ${c.vehiculo.modelo}` : '—'}</td>
                            <td className="muted">{c.vehiculo?.placa || '—'}</td>
                            <td className="muted" style={{ fontSize: '12px', maxWidth: '160px' }}>{serviciosNombres || '—'}</td>
                            <td>
                              <span className="badge" style={{ background: color + '22', color, border: `1px solid ${color}55` }}>
                                {c.estado || '—'}
                              </span>
                            </td>
                            <td>
                              <div className="acciones-fila">
                                <button className="btn-accion-tabla editar" onClick={() => abrirEditarCita(c)}>Editar</button>
                                <button className="btn-accion-tabla eliminar" onClick={() => eliminarCita(c)}>Eliminar</button>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
                </div>
              )}
            </div>
          )
        })()}

        {/* TABLA BOLETAS */}
        {(seccion === 'boletas' || seccion === 'boletas-hoy') && (
          <div className="panel">
            {cargando ? (
              <p className="muted">Cargando boletas...</p>
            ) : boletasFiltradas.length === 0 ? (
              <p className="muted">No hay boletas para mostrar.</p>
            ) : (
              <div className="tabla-wrapper">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Boleta</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Cliente</th>
                      <th>Vehículo</th>
                      <th>Placa</th>
                      <th>Estado</th>
                      <th>Pago</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {boletasFiltradas.map(b => {
                      return (
                        <tr key={b.id}>
                          <td className="numero-boleta">{b.numero}</td>
                          <td>{b.cita?.fecha || '—'}</td>
                          <td>{b.cita?.hora?.slice(0, 5) || '—'}</td>
                          <td>{b.perfil?.nombre || '—'}</td>
                          <td>{b.cita?.vehiculo ? `${b.cita.vehiculo.marca} ${b.cita.vehiculo.modelo}` : '—'}</td>
                          <td>{b.cita?.vehiculo?.placa || '—'}</td>
                          <td>
                            <select
                              className="select-rol"
                              value={b.estado || 'pendiente'}
                              onChange={e => cambiarEstadoBoleta(b, e.target.value)}
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En proceso</option>
                              <option value="completado">Completado</option>
                            </select>
                          </td>
                          <td className="muted">{b.tipo_pago || '—'}</td>
                          <td className="acciones-celda">
                            <button className="btn-accion-tabla" onClick={() => setBoletaTiempos(b)}>Tiempos</button>
                            <button className="btn-accion-tabla eliminar" onClick={() => eliminarBoleta(b)}>Eliminar</button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USUARIOS */}
        {seccion === 'usuarios' && (
          <div className="panel">
            <div className="filtros-rol">
              {['todos', 'admin', 'colaborador', 'cliente'].map(r => (
                <button
                  key={r}
                  className={`btn-filtro ${filtroRol === r ? 'sel' : ''}`}
                  onClick={() => setFiltroRol(r)}
                >
                  {r === 'todos' ? 'Todos' : r.charAt(0).toUpperCase() + r.slice(1)}
                  {r !== 'todos' && (
                    <span className="filtro-count">
                      {usuarios.filter(u => u.rol === r).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {cargandoUsuarios ? (
              <p className="muted">Cargando usuarios...</p>
            ) : usuariosFiltrados.length === 0 ? (
              <p className="muted">No hay usuarios en esta categoría.</p>
            ) : (
              <div className="tabla-wrapper">
                <table className="tabla">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Usuario / Correo</th>
                      <th>Teléfono</th>
                      <th>Rol</th>
                      <th>Estado</th>
                      <th>Notas</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuariosFiltrados.map(u => {
                      return (
                        <tr key={u.id} style={{ opacity: u.activo === false ? 0.5 : 1 }}>
                          <td>{u.nombre || '—'}</td>
                          <td className="muted">{u.correo || '—'}</td>
                          <td className="muted">{u.telefono || '—'}</td>
                          <td>
                            <select
                              className="select-rol"
                              value={u.rol || 'cliente'}
                              onChange={e => cambiarRol(u, e.target.value)}
                            >
                              <option value="cliente">Cliente</option>
                              <option value="colaborador">Colaborador</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td>
                            <span
                              className="badge"
                              style={u.activo === false
                                ? { background: '#33333322', color: '#666', border: '1px solid #33333355' }
                                : { background: '#22c55e22', color: '#22c55e', border: '1px solid #22c55e55' }
                              }
                            >
                              {u.activo === false ? 'Bloqueado' : 'Activo'}
                            </span>
                          </td>
                          <td className="muted" style={{ maxWidth: '160px', fontSize: '12px' }}>
                            {u.notas_admin || '—'}
                          </td>
                          <td>
                            <div className="acciones-fila">
                              <button className="btn-accion-tabla editar" onClick={() => abrirEditar(u)}>Editar</button>
                              <button
                                className={`btn-accion-tabla ${u.activo === false ? 'desbloquear' : 'bloquear'}`}
                                onClick={() => toggleBloqueo(u)}
                              >
                                {u.activo === false ? 'Activar' : 'Bloquear'}
                              </button>
                              <button className="btn-accion-tabla eliminar" onClick={() => eliminarUsuario(u)}>Eliminar</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </section>

      {/* MODAL EDITAR CITA */}
      {citaEditando && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar cita</h2>
            <p className="muted" style={{ marginTop: '-10px', marginBottom: '16px' }}>
              {citaEditando.perfil?.nombre} · {citaEditando.vehiculo ? `${citaEditando.vehiculo.marca} ${citaEditando.vehiculo.modelo}` : '—'}
            </p>

            <label>Fecha</label>
            <input type="date" value={editCFecha} onChange={e => setEditCFecha(e.target.value)} />

            <label>Hora</label>
            <input type="time" value={editCHora} onChange={e => setEditCHora(e.target.value)} />

            <label>Estado</label>
            <select className="select-rol" style={{ width: '100%', padding: '10px 14px', marginTop: '2px' }} value={editCEstado} onChange={e => setEditCEstado(e.target.value)}>
              <option value="pendiente">Pendiente</option>
              <option value="confirmada">Confirmada</option>
              <option value="cancelada">Cancelada</option>
              <option value="completada">Completada</option>
            </select>

            <label>Notas</label>
            <input value={editCNotas} onChange={e => setEditCNotas(e.target.value)} placeholder="Notas de la cita" />

            <div className="modal-acciones">
              <button className="btn-pri" onClick={guardarCitaAdmin} disabled={guardandoCita}>
                {guardandoCita ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className="btn-cancel" onClick={() => setCitaEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR USUARIO */}
      {usuarioEditando && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Editar usuario</h2>
            <p className="muted" style={{ marginTop: '-10px', marginBottom: '16px' }}>
              {usuarioEditando.correo} · {usuarioEditando.rol}
            </p>

            <label>Nombre</label>
            <input value={editNombre} onChange={e => setEditNombre(e.target.value)} placeholder="Nombre completo" />

            <label>Teléfono</label>
            <input value={editTelefono} onChange={e => setEditTelefono(e.target.value)} placeholder="Ej. 8888-8888" />

            <label>Notas internas</label>
            <input value={editNotas} onChange={e => setEditNotas(e.target.value)} placeholder="Observaciones del admin" />

            {esColaborador(usuarioEditando) && (
              <>
                <label>Nombre de usuario</label>
                <input value={editUsuario} onChange={e => setEditUsuario(e.target.value)} placeholder="Ej. juanperez" />
                <p className="hint">Dejá vacío para no cambiar · Se usará como: {editUsuario || '...' }@autocleancr.local</p>

                <label>Nueva contraseña</label>
                <input type="password" value={editClave} onChange={e => setEditClave(e.target.value)} placeholder="Dejá vacío para no cambiar" />
              </>
            )}

            {!esColaborador(usuarioEditando) && (
              <div style={{ marginTop: '20px', padding: '14px', background: '#1a1a1a', borderRadius: '10px', border: '1px solid #2a2a2a' }}>
                <p style={{ margin: '0 0 10px', fontSize: '13px', color: '#aaa' }}>
                  El cliente puede recuperar su clave desde el correo registrado.
                </p>
                <button
                  className="btn-reset"
                  onClick={() => enviarResetPassword(usuarioEditando)}
                  disabled={enviandoReset}
                >
                  {enviandoReset ? 'Enviando...' : 'Enviar email de recuperación'}
                </button>
              </div>
            )}

            <div className="modal-acciones">
              <button className="btn-pri" onClick={guardarEdicion} disabled={guardandoEdit}>
                {guardandoEdit ? 'Guardando...' : 'Guardar cambios'}
              </button>
              <button className="btn-cancel" onClick={() => setUsuarioEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR COLABORADOR */}
      {boletaTiempos && (() => {
        const b = boletaTiempos
        const serviciosDur = b.cita?.cita_servicios?.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0) ?? null
        const durReal = b.hora_inicio_trabajo && b.hora_termino_trabajo
          ? Math.round((new Date(b.hora_termino_trabajo) - new Date(b.hora_inicio_trabajo)) / 60000)
          : null
        const hayRetraso = durReal !== null && serviciosDur !== null && durReal > serviciosDur

        const fila = (label, valor, color) => (
          <div className="tiempos-fila">
            <span className="tiempos-label">{label}</span>
            <span className="tiempos-val" style={color ? { color } : {}}>
              {valor || <span className="tiempos-sin">—</span>}
            </span>
          </div>
        )

        return (
          <div className="modal-overlay">
            <div className="modal">
              <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                <img src="/logo-png.png" alt="AutoClean CR" style={{ height: '52px', objectFit: 'contain' }} />
              </div>
              <h2>Tiempos — {b.numero}</h2>
              <p className="hint" style={{ marginTop: 0 }}>{b.cita?.fecha} · {b.perfil?.nombre || '—'}</p>

              <div className="tiempos-tabla">
                {fila('Hora de llegada',         formatHora(b.hora_llegada))}
                {fila('Hora de inicio trabajo',  formatHora(b.hora_inicio_trabajo))}
                {fila('Hora de termino trabajo', formatHora(b.hora_termino_trabajo))}
                {fila('Hora de pago y recibido', formatHora(b.hora_pago), '#22c55e')}
              </div>

              {serviciosDur !== null && durReal !== null && (
                <div className={`tiempos-resumen ${hayRetraso ? 'retraso' : 'ok'}`}>
                  <span>Estimado: {serviciosDur} min</span>
                  <span>Real: {durReal} min</span>
                  {hayRetraso
                    ? <span className="retraso-diff">+{durReal - serviciosDur} min sobre el tiempo</span>
                    : <span className="ok-diff">Dentro del tiempo</span>
                  }
                </div>
              )}

              {b.notas_retraso && (
                <div className="notas-retraso-admin">
                  <div className="nr-titulo">Motivo del retraso (confidencial)</div>
                  <p>{b.notas_retraso}</p>
                </div>
              )}

              <div className="modal-acciones">
                <button className="btn-cancel" onClick={() => setBoletaTiempos(null)}>Cerrar</button>
              </div>
            </div>
          </div>
        )
      })()}

      {modalColaborador && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Crear colaborador</h2>

            <label>Nombre completo</label>
            <input value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} placeholder="Ej. Juan Pérez" />

            <label>Usuario (para iniciar sesión)</label>
            <input value={nuevoUsuario} onChange={e => setNuevoUsuario(e.target.value)} placeholder="Ej. juanperez" />
            <p className="hint">Se usará como: juanperez@autocleancr.local</p>

            <label>Contraseña</label>
            <input type="password" value={nuevoPassword} onChange={e => setNuevoPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />

            <label>Notas internas (opcional)</label>
            <input value={nuevoNotas} onChange={e => setNuevoNotas(e.target.value)} placeholder="Ej. Turno mañanas" />

            {errorCrear && <p className="error-msg">{errorCrear}</p>}

            <div className="modal-acciones">
              <button className="btn-pri" onClick={crearColaborador} disabled={creando}>
                {creando ? 'Creando...' : 'Crear colaborador'}
              </button>
              <button className="btn-cancel" onClick={() => setModalColaborador(false)}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-layout {
          min-height: 100vh; background: #080808; color: white;
          display: flex; font-family: Arial, sans-serif;
        }
        .sidebar {
          width: 280px; background: #0f0f0f; border-right: 1px solid #1f1f1f;
          padding: 30px 20px; display: flex; flex-direction: column;
          justify-content: space-between; position: sticky; top: 0; height: 100vh;
          overflow-y: auto;
        }
        .logo { height: 90px; object-fit: contain; margin-bottom: 16px; display: block; }
        .role { color: #666; font-size: 11px; letter-spacing: .2em; margin-bottom: 40px; }
        .menu { display: flex; flex-direction: column; gap: 8px; }
        .menu button {
          color: #aaa; background: #111; border: none; padding: 13px 16px;
          border-radius: 10px; cursor: pointer; text-align: left; font-size: 14px; transition: .15s;
        }
        .menu button:hover, .menu button.activo { background: #4FC3F7; color: #000; font-weight: 700; }
        .logout { border: none; background: #1f1f1f; color: #fff; padding: 14px; border-radius: 10px; cursor: pointer; }

        .content { flex: 1; padding: 40px; overflow-y: auto; }
        .topbar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; flex-wrap: wrap; gap: 12px; }
        .topbar h1 { font-size: 34px; margin: 0 0 6px; }
        .topbar p { color: #777; margin: 0; }
        .btn-nuevo { background: #4FC3F7; color: #000; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-weight: 700; font-size: 14px; }

        .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px; }
        .card { background: #111; border: 1px solid #222; border-radius: 18px; padding: 24px; }
        .card-title { color: #777; margin-bottom: 12px; font-size: 14px; }
        .card-number { font-size: 48px; font-weight: 900; color: #4FC3F7; }

        .panel { background: #111; border: 1px solid #222; border-radius: 18px; padding: 28px; margin-bottom: 24px; }
        .panel h2 { margin-bottom: 20px; }
        .muted { color: #666; font-size: 13px; }

        .tabla-wrapper { overflow-x: auto; }
        .tabla { width: 100%; border-collapse: collapse; font-size: 14px; }
        .tabla th { color: #777; font-weight: 600; padding: 10px 14px; text-align: left; border-bottom: 1px solid #222; white-space: nowrap; }
        .tabla td { padding: 12px 14px; border-bottom: 1px solid #1a1a1a; vertical-align: middle; }
        .tabla tr:hover td { background: #161616; }
        .numero-boleta { font-weight: 700; color: #4FC3F7; }
        .badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; white-space: nowrap; }

        .filtros-rol { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .btn-filtro { background: #1a1a1a; color: #888; border: 1px solid #333; padding: 7px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; }
        .btn-filtro.sel { background: #0d2230; color: #4FC3F7; border-color: #4FC3F7; font-weight: 700; }
        .filtro-count { background: #333; color: #aaa; padding: 1px 7px; border-radius: 10px; font-size: 11px; }
        .btn-filtro.sel .filtro-count { background: #4FC3F722; color: #4FC3F7; }

        .select-rol { background: #1a1a1a; color: #ccc; border: 1px solid #333; padding: 5px 10px; border-radius: 6px; font-size: 13px; cursor: pointer; }
        .acciones-fila { display: flex; gap: 6px; flex-wrap: wrap; }
        .btn-accion-tabla { border: none; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 700; white-space: nowrap; background: #1a2a3a; color: #7dd3fc; }
        .btn-accion-tabla.editar    { background: #1e3a5f; color: #7dd3fc; }
        .btn-accion-tabla.bloquear  { background: #7f1d1d; color: #fca5a5; }
        .btn-accion-tabla.desbloquear { background: #14532d; color: #86efac; }
        .btn-accion-tabla.eliminar  { background: #3b1010; color: #f87171; }
        .acciones-celda { display: flex; gap: 6px; flex-wrap: wrap; }

        .tiempos-tabla { display: flex; flex-direction: column; gap: 6px; margin: 16px 0; }
        .tiempos-fila { display: flex; justify-content: space-between; align-items: center; padding: 9px 12px; background: #1a1a1a; border-radius: 8px; gap: 12px; }
        .tiempos-label { color: #888; font-size: 13px; }
        .tiempos-val { font-size: 14px; font-weight: 700; color: #fff; }
        .tiempos-sin { color: #444; font-weight: 400; }
        .tiempos-resumen {
          display: flex; gap: 16px; flex-wrap: wrap; align-items: center;
          padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 12px;
        }
        .tiempos-resumen.ok { background: #0a2a0a; border: 1px solid #22c55e33; color: #86efac; }
        .tiempos-resumen.retraso { background: #1a1000; border: 1px solid #f59e0b44; color: #fcd34d; }
        .ok-diff { font-weight: 700; color: #22c55e; }
        .retraso-diff { font-weight: 700; color: #f59e0b; }
        .notas-retraso-admin { background: #1a1000; border: 1px solid #f59e0b33; border-radius: 8px; padding: 12px; margin-bottom: 12px; }
        .nr-titulo { color: #f59e0b; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 6px; }
        .notas-retraso-admin p { color: #ccc; font-size: 13px; margin: 0; }

        .estados-resumen { display: flex; gap: 16px; flex-wrap: wrap; }
        .estado-card { background: #1a1a1a; border: 1px solid #333; border-radius: 12px; padding: 20px 30px; text-align: center; min-width: 120px; }
        .estado-numero { font-size: 40px; font-weight: 900; }
        .estado-label { color: #888; font-size: 13px; margin-top: 4px; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal { background: #161616; border: 1px solid #2a2a2a; border-radius: 18px; padding: 34px; width: 100%; max-width: 480px; }
        .modal h2 { margin: 0 0 24px; font-size: 22px; }
        .modal label { display: block; color: #888; font-size: 12px; margin-bottom: 6px; margin-top: 16px; }
        .modal input { width: 100%; background: #1e1e1e; border: 1px solid #333; color: white; padding: 10px 14px; border-radius: 8px; font-size: 14px; box-sizing: border-box; }
        .hint { color: #555; font-size: 12px; margin: 4px 0 0; }
        .error-msg { color: #f87171; font-size: 13px; margin-top: 12px; }
        .modal-acciones { display: flex; gap: 10px; margin-top: 24px; }
        .btn-pri { background: #4FC3F7; color: #000; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-weight: 700; font-size: 14px; }
        .btn-cancel { background: transparent; color: #888; border: 1px solid #333; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
        .btn-pri:disabled { opacity: .6; cursor: default; }
        .btn-reset { background: #1e3a5f; color: #7dd3fc; border: 1px solid #2563eb55; padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 700; }
        .btn-reset:disabled { opacity: .6; cursor: default; }

        @media (max-width: 1000px) {
          .admin-layout { flex-direction: column; }
          .sidebar { width: 100%; height: auto; position: static; }
          .cards { grid-template-columns: repeat(2, 1fr); }
          .content { padding: 20px; }
          .topbar h1 { font-size: 26px; }
        }
      `}</style>
    </main>
  )
}
