'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'

function FirmaCanvas({ titulo, onGuardar, onCerrar }) {
  const canvasRef = useRef(null)
  const isDrawing = useRef(false)
  const lastPos = useRef(null)

  function getPos(e) {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    }
  }

  function startDraw(e) {
    e.preventDefault()
    isDrawing.current = true
    lastPos.current = getPos(e)
  }

  function draw(e) {
    e.preventDefault()
    if (!isDrawing.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(lastPos.current.x, lastPos.current.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#111'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
    lastPos.current = pos
  }

  function endDraw() { isDrawing.current = false }

  function limpiar() {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
  }

  function guardar() {
    onGuardar(canvasRef.current.toDataURL('image/png'))
  }

  return (
    <div className="firma-overlay">
      <div className="firma-box">
        <h3>{titulo}</h3>
        <p className="firma-hint">Firme dentro del recuadro blanco</p>
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        <div className="firma-acciones">
          <button className="btn-sec" onClick={limpiar}>Limpiar</button>
          <button className="btn-pri" onClick={guardar}>Guardar firma</button>
          <button className="btn-cancel" onClick={onCerrar}>Cancelar</button>
        </div>
      </div>
      <style jsx>{`
        .firma-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,.85);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000;
          padding: 20px;
        }
        .firma-box {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 16px;
          padding: 30px;
          width: 100%;
          max-width: 580px;
        }
        .firma-box h3 { margin: 0 0 6px; font-size: 20px; }
        .firma-hint { color: #777; font-size: 13px; margin: 0 0 16px; }
        canvas {
          background: white;
          border-radius: 10px;
          width: 100%;
          cursor: crosshair;
          touch-action: none;
          display: block;
        }
        .firma-acciones {
          display: flex; gap: 10px; margin-top: 16px; flex-wrap: wrap;
        }
        .btn-pri {
          background: #4FC3F7; color: #000; font-weight: 700;
          border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer;
        }
        .btn-sec {
          background: #222; color: #fff;
          border: 1px solid #444; padding: 10px 20px; border-radius: 8px; cursor: pointer;
        }
        .btn-cancel {
          background: transparent; color: #888;
          border: 1px solid #333; padding: 10px 20px; border-radius: 8px; cursor: pointer;
        }
      `}</style>
    </div>
  )
}

const BADGE = {
  pendiente:  { label: 'Pendiente',  color: '#f59e0b' },
  en_proceso: { label: 'En proceso', color: '#3b82f6' },
  completado: { label: 'Completado', color: '#22c55e' },
}

export default function ColaboradorPage() {
  const [cargando, setCargando]           = useState(true)
  const [fechaFiltro, setFechaFiltro]     = useState(new Date().toISOString().split('T')[0])
  const [boletas, setBoletas]             = useState([])
  const [boletaActiva, setBoletaActiva]   = useState(null)
  const [cargandoBoleta, setCargandoBoleta] = useState(false)
  const [modalFirma, setModalFirma]       = useState(null) // 'inicio' | 'fin'
  const [guardando, setGuardando]         = useState(false)
  const [subiendoFoto, setSubiendoFoto]   = useState(false)
  const [tipoPagoSel, setTipoPagoSel]     = useState('')
  const [descansos, setDescansos]         = useState([])
  const [notasDano, setNotasDano]         = useState('')
  const [notasColab, setNotasColab]         = useState('')
  const [boletaCeramico, setBoletaCeramico] = useState(false)
  const [boletaPpf, setBoletaPpf]           = useState(false)
  const [boletaWrap, setBoletaWrap]         = useState(false)
  const [acabadoInterno, setAcabadoInterno] = useState('')
  const [aroma, setAroma]                   = useState('')
  const [notasRetraso, setNotasRetraso]     = useState('')

  useEffect(() => { verificarSesion() }, [])

  async function verificarSesion() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { window.location.href = '/login'; return }
    setCargando(false)
    cargarBoletas(new Date().toISOString().split('T')[0])
  }

  async function cargarBoletas(fecha) {
    const [resB, resD] = await Promise.all([
      fetch(`/api/boletas?fecha=${fecha}`),
      fetch(`/api/descansos?fecha=${fecha}`),
    ])
    const jsonB = await resB.json()
    const jsonD = await resD.json()
    setBoletas(jsonB.boletas || [])
    setDescansos(jsonD.descansos || [])
  }

  useEffect(() => {
    if (!cargando) cargarBoletas(fechaFiltro)
  }, [fechaFiltro])

  async function abrirBoleta(id) {
    setCargandoBoleta(true)
    setBoletaActiva(null)
    const res = await fetch(`/api/boletas/${id}`)
    const json = await res.json()
    const b = json.boleta
    setBoletaActiva(b)
    setNotasDano(b.descripcion_danos || '')
    setNotasColab(b.notas_colaborador || '')
    setTipoPagoSel(b.tipo_pago || '')
    setNotasRetraso(b.notas_retraso || '')
    const veh = b.cita?.vehiculo
    setBoletaCeramico(b.tiene_ceramico ?? veh?.tiene_ceramico ?? false)
    setBoletaPpf(b.tiene_ppf ?? veh?.tiene_ppf ?? false)
    setBoletaWrap(b.tiene_wrap ?? veh?.tiene_wrap ?? false)
    setAcabadoInterno(b.acabado_interno || '')
    setAroma(b.aroma || '')
    setCargandoBoleta(false)
  }

  function formatHora(iso) {
    if (!iso) return null
    return new Date(iso).toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit' })
  }

  async function registrarLlegada() {
    setGuardando(true)
    const res = await fetch(`/api/boletas/${boletaActiva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hora_llegada: new Date().toISOString() }),
    })
    const json = await res.json()
    if (json.error) { alert('Error: ' + json.error); setGuardando(false); return }
    await abrirBoleta(boletaActiva.id)
    setGuardando(false)
  }

  async function registrarTerminoTrabajo() {
    setGuardando(true)
    const res = await fetch(`/api/boletas/${boletaActiva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hora_termino_trabajo: new Date().toISOString() }),
    })
    const json = await res.json()
    if (json.error) { alert('Error: ' + json.error); setGuardando(false); return }
    await abrirBoleta(boletaActiva.id)
    setGuardando(false)
  }

  async function guardarNotasRetraso() {
    setGuardando(true)
    await fetch(`/api/boletas/${boletaActiva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas_retraso: notasRetraso }),
    })
    setGuardando(false)
    alert('Motivo guardado.')
  }

  async function guardarNotas() {
    if (!boletaActiva) return
    setGuardando(true)
    await fetch(`/api/boletas/${boletaActiva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        descripcion_danos: notasDano,
        notas_colaborador: notasColab,
        tiene_ceramico: boletaCeramico,
        tiene_ppf: boletaPpf,
        tiene_wrap: boletaWrap,
        acabado_interno: acabadoInterno,
        aroma,
      }),
    })
    setGuardando(false)
    alert('Información guardada.')
  }

  async function subirFoto(file, tipo) {
    if (!boletaActiva || !file) return
    setSubiendoFoto(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('tipo', tipo)
    const res = await fetch(`/api/boletas/${boletaActiva.id}/fotos`, {
      method: 'POST',
      body: formData,
    })
    const json = await res.json()
    if (json.foto) {
      setBoletaActiva(prev => ({ ...prev, fotos: [...(prev.fotos || []), json.foto] }))
    } else {
      alert('Error al subir foto: ' + (json.error || 'desconocido'))
    }
    setSubiendoFoto(false)
  }

  async function iniciarServicio(firmaBase64) {
    setGuardando(true)
    const res = await fetch(`/api/boletas/${boletaActiva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firma_inicio: firmaBase64,
        hora_inicio_trabajo: new Date().toISOString(),
        estado: 'en_proceso',
        descripcion_danos: notasDano,
        notas_colaborador: notasColab,
        tiene_ceramico: boletaCeramico,
        tiene_ppf: boletaPpf,
        tiene_wrap: boletaWrap,
        acabado_interno: acabadoInterno,
        aroma,
      }),
    })
    const json = await res.json()
    if (json.error) { alert('Error: ' + json.error); setGuardando(false); return }
    setModalFirma(null)
    await abrirBoleta(boletaActiva.id)
    await cargarBoletas(fechaFiltro)
    setGuardando(false)
  }

  async function finalizarServicio(firmaBase64) {
    if (!tipoPagoSel) { alert('Seleccioná el tipo de pago antes de finalizar.'); return }
    const fotosPago = (boletaActiva.fotos || []).filter(f => f.tipo === 'pago')
    if (fotosPago.length === 0) { alert('Subí el comprobante de pago antes de finalizar.'); return }
    setGuardando(true)
    const res = await fetch(`/api/boletas/${boletaActiva.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firma_fin: firmaBase64,
        hora_pago: new Date().toISOString(),
        estado: 'completado',
        tipo_pago: tipoPagoSel,
        notas_colaborador: notasColab,
        ...(notasRetraso ? { notas_retraso: notasRetraso } : {}),
      }),
    })
    const json = await res.json()
    if (json.error) { alert('Error: ' + json.error); setGuardando(false); return }
    setModalFirma(null)
    await abrirBoleta(boletaActiva.id)
    await cargarBoletas(fechaFiltro)
    setGuardando(false)
  }

  function onFirmaGuardada(base64) {
    if (modalFirma === 'inicio') iniciarServicio(base64)
    else if (modalFirma === 'fin') finalizarServicio(base64)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  if (cargando) {
    return (
      <main style={{ minHeight: '100vh', background: '#080808', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
        Cargando...
      </main>
    )
  }

  const fotosDano      = (boletaActiva?.fotos || []).filter(f => f.tipo === 'dano')
  const fotosTerminado = (boletaActiva?.fotos || []).filter(f => f.tipo === 'terminado')
  const fotosPago      = (boletaActiva?.fotos || []).filter(f => f.tipo === 'pago')
  const servicios      = boletaActiva?.cita?.cita_servicios || []
  const duracionTotal  = servicios.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0)
  const precioTotal    = servicios.reduce((s, cs) => s + (cs.precio || 0), 0)

  return (
    <main className="layout">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div>
          <div className="brand">AUTO CLEAN CR</div>
          <div className="role">COLABORADOR</div>
        </div>
        <div className="fecha-filtro">
          <label>Fecha</label>
          <input
            type="date"
            value={fechaFiltro}
            onChange={e => setFechaFiltro(e.target.value)}
          />
        </div>
        <div className="lista-boletas">
          {boletas.length === 0 && (
            <p className="sin-boletas">Sin boletas para esta fecha</p>
          )}
          {boletas.map(b => {
            const badge = BADGE[b.estado] || BADGE.pendiente
            return (
              <button
                key={b.id}
                className={`boleta-item ${boletaActiva?.id === b.id ? 'activa' : ''}`}
                onClick={() => abrirBoleta(b.id)}
              >
                <div className="boleta-numero">{b.numero}</div>
                <div className="boleta-cliente">{b.perfil?.nombre || 'Cliente'}</div>
                <div className="boleta-vehiculo">
                  {b.cita?.vehiculo ? `${b.cita.vehiculo.marca} ${b.cita.vehiculo.modelo}` : '—'}
                </div>
                <div className="boleta-hora">{b.cita?.hora?.slice(0, 5) || '—'}</div>
                <span className="badge" style={{ background: badge.color + '22', color: badge.color, border: `1px solid ${badge.color}55` }}>
                  {badge.label}
                </span>
              </button>
            )
          })}
        </div>
        <div className="descansos-panel">
          <div className="descansos-titulo">Descansos del día</div>
          {descansos.map(d => (
            <div key={d.id} className="descanso-fila">
              <span className="descanso-nombre">{d.nombre}</span>
              <span className="descanso-hora">
                {d.horaInicio
                  ? `${d.horaInicio} — ${d.horaFin}`
                  : 'Sin espacio disponible'}
              </span>
            </div>
          ))}
        </div>
        <button className="logout" onClick={cerrarSesion}>Cerrar sesión</button>
      </aside>

      {/* CONTENIDO */}
      <section className="content">
        {!boletaActiva && !cargandoBoleta && (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <h2>Seleccioná una boleta</h2>
            <p>Elegí una boleta del panel izquierdo para ver el detalle y gestionar el servicio.</p>
          </div>
        )}

        {cargandoBoleta && (
          <div className="empty-state">
            <p>Cargando boleta...</p>
          </div>
        )}

        {boletaActiva && !cargandoBoleta && (
          <div className="detalle">
            {/* ENCABEZADO */}
            <div className="detalle-header">
              <div>
                <h1>{boletaActiva.numero}</h1>
                <p className="detalle-fecha">
                  {boletaActiva.cita?.fecha} · {boletaActiva.cita?.hora?.slice(0, 5)}
                </p>
              </div>
              <span
                className="badge-grande"
                style={{
                  background: (BADGE[boletaActiva.estado]?.color || '#777') + '22',
                  color: BADGE[boletaActiva.estado]?.color || '#777',
                  border: `1px solid ${BADGE[boletaActiva.estado]?.color || '#777'}55`,
                }}
              >
                {BADGE[boletaActiva.estado]?.label || boletaActiva.estado}
              </span>
            </div>

            {/* CLIENTE Y VEHÍCULO */}
            <div className="info-grid">
              <div className="info-card">
                <div className="info-card-title">Cliente</div>
                <div className="info-linea">{boletaActiva.perfil?.nombre || '—'}</div>
                <div className="info-linea muted">{boletaActiva.perfil?.telefono || '—'}</div>
                <div className="info-linea muted">{boletaActiva.perfil?.email || '—'}</div>
              </div>
              <div className="info-card">
                <div className="info-card-title">Vehículo</div>
                <div className="info-linea">
                  {boletaActiva.cita?.vehiculo
                    ? `${boletaActiva.cita.vehiculo.marca} ${boletaActiva.cita.vehiculo.modelo} ${boletaActiva.cita.vehiculo.anio || ''}`
                    : '—'}
                </div>
                <div className="info-linea muted">
                  Placa: {boletaActiva.cita?.vehiculo?.placa || '—'} · Color: {boletaActiva.cita?.vehiculo?.color || '—'}
                </div>
              </div>
              <div className="info-card">
                <div className="info-card-title">Ubicación</div>
                <div className="info-linea">
                  {[boletaActiva.cita?.distrito, boletaActiva.cita?.canton, boletaActiva.cita?.provincia]
                    .filter(Boolean).join(', ') || '—'}
                </div>
                <div className="info-linea muted">{boletaActiva.cita?.direccion_detallada || ''}</div>
              </div>
            </div>

            {/* SERVICIOS */}
            <div className="seccion">
              <h3>Servicios</h3>
              <div className="servicios-lista">
                {servicios.map((cs, i) => (
                  <div key={i} className="servicio-fila">
                    <span>{cs.servicio?.nombre || '—'}</span>
                    <span className="muted">{cs.duracion_minutos} min · ₡{(cs.precio || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {servicios.length > 0 && (
                <div className="servicio-total">
                  Total: {duracionTotal} min · ₡{precioTotal.toLocaleString()}
                </div>
              )}
              {boletaActiva.cita?.notas && (
                <div className="notas-cita">Notas: {boletaActiva.cita.notas}</div>
              )}
            </div>

            {/* TIEMPOS DEL SERVICIO */}
            <div className="seccion">
              <h3>Registro de tiempos</h3>
              <div className="tiempos-lista">
                <div className="tiempo-fila">
                  <span className="tiempo-etiqueta">Hora de llegada</span>
                  {boletaActiva.hora_llegada
                    ? <span className="tiempo-valor">{formatHora(boletaActiva.hora_llegada)}</span>
                    : boletaActiva.estado !== 'completado'
                      ? <button className="btn-tiempo" onClick={registrarLlegada} disabled={guardando}>Registrar llegada</button>
                      : <span className="tiempo-vacio">—</span>
                  }
                </div>
                <div className="tiempo-fila">
                  <span className="tiempo-etiqueta">Hora de inicio trabajo</span>
                  {boletaActiva.hora_inicio_trabajo
                    ? <span className="tiempo-valor">{formatHora(boletaActiva.hora_inicio_trabajo)}</span>
                    : <span className="tiempo-pendiente">Se registra al firmar inicio</span>
                  }
                </div>
                {(boletaActiva.estado === 'en_proceso' || boletaActiva.estado === 'completado') && (
                  <div className="tiempo-fila">
                    <span className="tiempo-etiqueta">Hora termino trabajo</span>
                    {boletaActiva.hora_termino_trabajo
                      ? <span className="tiempo-valor">{formatHora(boletaActiva.hora_termino_trabajo)}</span>
                      : boletaActiva.estado === 'en_proceso'
                        ? <button className="btn-tiempo naranja" onClick={registrarTerminoTrabajo} disabled={guardando}>Registrar fin de trabajo</button>
                        : <span className="tiempo-vacio">—</span>
                    }
                  </div>
                )}
                {(boletaActiva.estado === 'en_proceso' || boletaActiva.estado === 'completado') && (
                  <div className="tiempo-fila">
                    <span className="tiempo-etiqueta">Hora de pago y recibido</span>
                    {boletaActiva.hora_pago
                      ? <span className="tiempo-valor verde">{formatHora(boletaActiva.hora_pago)}</span>
                      : <span className="tiempo-pendiente">Se registra al firmar finalización</span>
                    }
                  </div>
                )}
              </div>

              {/* Overtime detection */}
              {boletaActiva.hora_inicio_trabajo && boletaActiva.hora_termino_trabajo && (() => {
                const estimado = servicios.reduce((s, cs) => s + (cs.duracion_minutos || 0), 0)
                const real = Math.round((new Date(boletaActiva.hora_termino_trabajo) - new Date(boletaActiva.hora_inicio_trabajo)) / 60000)
                if (real <= estimado) return null
                return (
                  <div className="retraso-box">
                    <div className="retraso-alerta">
                      Estimado: {estimado} min · Real: {real} min (+{real - estimado} min sobre el tiempo)
                    </div>
                    <div className="campo-label-sm" style={{ marginTop: '12px' }}>Motivo del tiempo adicional</div>
                    <textarea
                      className="textarea"
                      placeholder="Indicá la razón por la que el servicio tomó más tiempo del estimado..."
                      value={notasRetraso}
                      onChange={e => setNotasRetraso(e.target.value)}
                      disabled={boletaActiva.estado === 'completado'}
                      rows={3}
                    />
                    {boletaActiva.estado !== 'completado' && (
                      <button className="btn-guardar" onClick={guardarNotasRetraso} disabled={guardando} style={{ marginTop: '8px' }}>
                        {guardando ? 'Guardando...' : 'Guardar motivo'}
                      </button>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* ESTADO DEL VEHÍCULO AL LLEGAR */}
            <div className="seccion">
              <h3>Estado del vehículo al llegar</h3>
              {boletaActiva.firma_inicio && (
                <p className="campo-bloqueado">✓ Información bloqueada tras firma de inicio</p>
              )}
              <textarea
                className="textarea"
                placeholder="Describa los daños existentes, rayones, abolladuras, etc."
                value={notasDano}
                onChange={e => setNotasDano(e.target.value)}
                disabled={!!boletaActiva.firma_inicio}
                rows={4}
              />
              <div className="fotos-seccion">
                <div className="fotos-header">
                  <span>Fotos de daños ({fotosDano.length})</span>
                  {!boletaActiva.firma_inicio && !subiendoFoto && (
                    <div className="upload-botones">
                      <label className="btn-upload">
                        Camara
                        <input type="file" accept="image/*" capture="environment" hidden
                          onChange={e => e.target.files[0] && subirFoto(e.target.files[0], 'dano')} />
                      </label>
                      <label className="btn-upload-gal">
                        Galeria
                        <input type="file" accept="image/*" hidden
                          onChange={e => e.target.files[0] && subirFoto(e.target.files[0], 'dano')} />
                      </label>
                    </div>
                  )}
                  {subiendoFoto && <span className="subiendo-txt">Subiendo...</span>}
                </div>
                <div className="fotos-grid">
                  {fotosDano.map(f => (
                    <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                      <img src={f.url} alt="daño" className="foto-thumb" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* PROTECCIONES Y ACABADO */}
            <div className="seccion">
              <h3>Protecciones y acabado del vehículo</h3>
              {boletaActiva.firma_inicio && (
                <p className="campo-bloqueado">✓ Información bloqueada tras firma de inicio</p>
              )}
              <p className="muted" style={{ marginTop: 0, marginBottom: '14px', fontSize: '13px' }}>
                Verificá con el cliente. Si el estado cambió desde el registro, actualizalo aquí — se guardará también en el perfil del vehículo.
              </p>
              <div className="protecciones-grupo">
                {[
                  { key: 'ceramico', label: 'Cerámico', val: boletaCeramico, set: setBoletaCeramico },
                  { key: 'ppf',      label: 'PPF',      val: boletaPpf,      set: setBoletaPpf },
                  { key: 'wrap',     label: 'Wrap',     val: boletaWrap,     set: setBoletaWrap },
                ].map(({ key, label, val, set }) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn-prot ${val ? 'activo' : ''}`}
                    onClick={() => !boletaActiva.firma_inicio && set(!val)}
                    disabled={!!boletaActiva.firma_inicio}
                  >
                    {label}: {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
              <div style={{ marginTop: '16px' }}>
                <div className="campo-label-sm">Acabado interno</div>
                <div className="acabado-grupo">
                  {['mate', 'satinado', 'brillante'].map(op => (
                    <button
                      key={op}
                      type="button"
                      className={`btn-acabado ${acabadoInterno === op ? 'sel' : ''}`}
                      onClick={() => !boletaActiva.firma_inicio && setAcabadoInterno(op)}
                      disabled={!!boletaActiva.firma_inicio}
                    >
                      {op.charAt(0).toUpperCase() + op.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: '14px' }}>
                <div className="campo-label-sm">Aroma</div>
                <input
                  className="input-field"
                  placeholder="Nombre del aroma utilizado"
                  value={aroma}
                  onChange={e => setAroma(e.target.value)}
                  disabled={!!boletaActiva.firma_inicio}
                />
              </div>
            </div>

            {/* NOTAS DEL COLABORADOR */}
            <div className="seccion">
              <h3>Notas del colaborador</h3>
              {boletaActiva.firma_inicio && (
                <p className="campo-bloqueado">✓ Información bloqueada tras firma de inicio</p>
              )}
              <textarea
                className="textarea"
                placeholder="Observaciones especiales del vehículo, cliente o condiciones del servicio..."
                value={notasColab}
                onChange={e => setNotasColab(e.target.value)}
                disabled={!!boletaActiva.firma_inicio}
                rows={3}
              />
            </div>

            {/* GUARDAR INFO PRE-SERVICIO */}
            {!boletaActiva.firma_inicio && (
              <div style={{ marginBottom: '20px' }}>
                <button className="btn-guardar" onClick={guardarNotas} disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Guardar información pre-servicio'}
                </button>
              </div>
            )}

            {/* FIRMA DE INICIO */}
            {boletaActiva.estado === 'pendiente' && (
              <div className="seccion">
                <h3>Iniciar servicio</h3>
                <p className="muted">Solicitá la firma del cliente para confirmar el estado inicial del vehículo e iniciar el trabajo.</p>
                <button
                  className="btn-accion verde"
                  onClick={() => setModalFirma('inicio')}
                  disabled={guardando}
                >
                  Firma cliente e iniciar servicio
                </button>
              </div>
            )}

            {boletaActiva.firma_inicio && (
              <div className="seccion">
                <h3>Firma inicio</h3>
                <img src={boletaActiva.firma_inicio} alt="firma inicio" className="firma-preview" />
              </div>
            )}

            {/* FOTOS TRABAJO TERMINADO */}
            {(boletaActiva.estado === 'en_proceso' || boletaActiva.estado === 'completado') && (
              <div className="seccion">
                <h3>Fotos del trabajo terminado</h3>
                <div className="fotos-seccion">
                  <div className="fotos-header">
                    <span>Fotos ({fotosTerminado.length})</span>
                    {boletaActiva.estado === 'en_proceso' && !subiendoFoto && (
                      <div className="upload-botones">
                        <label className="btn-upload">
                          Camara
                          <input type="file" accept="image/*" capture="environment" hidden
                            onChange={e => e.target.files[0] && subirFoto(e.target.files[0], 'terminado')} />
                        </label>
                        <label className="btn-upload-gal">
                          Galeria
                          <input type="file" accept="image/*" hidden
                            onChange={e => e.target.files[0] && subirFoto(e.target.files[0], 'terminado')} />
                        </label>
                      </div>
                    )}
                    {subiendoFoto && <span className="subiendo-txt">Subiendo...</span>}
                  </div>
                  <div className="fotos-grid">
                    {fotosTerminado.map(f => (
                      <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                        <img src={f.url} alt="terminado" className="foto-thumb" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* COMPROBANTE DE PAGO */}
            {(boletaActiva.estado === 'en_proceso' || boletaActiva.estado === 'completado') && (
              <div className="seccion">
                <h3>Comprobante de pago</h3>
                <div className="tipo-pago-opciones">
                  {['sinpe', 'tarjeta'].map(tp => (
                    <button
                      key={tp}
                      className={`btn-tipo-pago ${tipoPagoSel === tp ? 'sel' : ''}`}
                      onClick={() => boletaActiva.estado === 'en_proceso' && setTipoPagoSel(tp)}
                    >
                      {tp === 'sinpe' ? 'Sinpe' : tp === 'tarjeta' ? 'Tarjeta' : 'Efectivo'}
                    </button>
                  ))}
                </div>
                <div className="fotos-seccion" style={{ marginTop: '12px' }}>
                  <div className="fotos-header">
                    <span>Foto comprobante ({fotosPago.length})</span>
                    {boletaActiva.estado === 'en_proceso' && !subiendoFoto && (
                      <div className="upload-botones">
                        <label className="btn-upload">
                          Camara
                          <input type="file" accept="image/*" capture="environment" hidden
                            onChange={e => e.target.files[0] && subirFoto(e.target.files[0], 'pago')} />
                        </label>
                        <label className="btn-upload-gal">
                          Galeria
                          <input type="file" accept="image/*" hidden
                            onChange={e => e.target.files[0] && subirFoto(e.target.files[0], 'pago')} />
                        </label>
                      </div>
                    )}
                    {subiendoFoto && <span className="subiendo-txt">Subiendo...</span>}
                  </div>
                  <div className="fotos-grid">
                    {fotosPago.map(f => (
                      <a key={f.id} href={f.url} target="_blank" rel="noreferrer">
                        <img src={f.url} alt="pago" className="foto-thumb" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* FIRMA DE FIN */}
            {boletaActiva.estado === 'en_proceso' && (
              <div className="seccion">
                <h3>Finalizar servicio</h3>
                <p className="muted">Asegurate de haber subido las fotos del trabajo terminado y el comprobante de pago antes de finalizar.</p>
                <button
                  className="btn-accion azul"
                  onClick={() => setModalFirma('fin')}
                  disabled={guardando}
                >
                  Firma cliente y finalizar servicio
                </button>
              </div>
            )}

            {boletaActiva.firma_fin && (
              <div className="seccion">
                <h3>Firma finalización</h3>
                <img src={boletaActiva.firma_fin} alt="firma fin" className="firma-preview" />
              </div>
            )}

            {boletaActiva.estado === 'completado' && (
              <div className="seccion completado-banner">
                Servicio completado · Pago: {boletaActiva.tipo_pago || '—'}
              </div>
            )}
          </div>
        )}
      </section>

      {/* MODAL FIRMA */}
      {modalFirma && (
        <FirmaCanvas
          titulo={modalFirma === 'inicio' ? 'Firma del cliente — Inicio de servicio' : 'Firma del cliente — Finalización de servicio'}
          onGuardar={onFirmaGuardada}
          onCerrar={() => setModalFirma(null)}
        />
      )}

      <style jsx>{`
        .layout {
          min-height: 100vh;
          background: #080808;
          color: white;
          display: flex;
          font-family: Arial, sans-serif;
        }
        .sidebar {
          width: 300px;
          min-width: 300px;
          background: #0f0f0f;
          border-right: 1px solid #1f1f1f;
          padding: 24px 16px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          overflow-y: auto;
          max-height: 100vh;
          position: sticky;
          top: 0;
        }
        .brand { color: #4FC3F7; font-size: 20px; font-weight: 900; }
        .role { color: #555; font-size: 11px; letter-spacing: .2em; margin-top: 2px; }
        .fecha-filtro label { display: block; color: #777; font-size: 12px; margin-bottom: 6px; }
        .fecha-filtro input {
          width: 100%; background: #1a1a1a; border: 1px solid #333; color: white;
          padding: 8px 10px; border-radius: 8px; font-size: 14px; box-sizing: border-box;
        }
        .lista-boletas { display: flex; flex-direction: column; gap: 8px; flex: 1; }
        .sin-boletas { color: #555; font-size: 13px; text-align: center; padding: 20px 0; }
        .boleta-item {
          background: #141414; border: 1px solid #222; border-radius: 10px;
          padding: 12px 14px; text-align: left; cursor: pointer; transition: .15s;
          color: white; width: 100%;
        }
        .boleta-item:hover { border-color: #4FC3F7; }
        .boleta-item.activa { border-color: #4FC3F7; background: #0d2230; }
        .boleta-numero { font-size: 16px; font-weight: 700; margin-bottom: 2px; }
        .boleta-cliente { font-size: 13px; color: #ccc; }
        .boleta-vehiculo { font-size: 12px; color: #666; margin-top: 2px; }
        .boleta-hora { font-size: 12px; color: #888; margin-top: 4px; }
        .badge {
          display: inline-block; font-size: 11px; font-weight: 700;
          padding: 2px 8px; border-radius: 20px; margin-top: 6px;
        }
        .descansos-panel {
          background: #111; border: 1px solid #1f1f1f; border-radius: 10px;
          padding: 12px 14px;
        }
        .descansos-titulo {
          color: #4FC3F7; font-size: 10px; font-weight: 700;
          text-transform: uppercase; letter-spacing: .15em; margin-bottom: 10px;
        }
        .descanso-fila {
          display: flex; justify-content: space-between; align-items: baseline;
          gap: 8px; padding: 4px 0; border-bottom: 1px solid #1a1a1a; font-size: 12px;
        }
        .descanso-fila:last-child { border-bottom: none; }
        .descanso-nombre { color: #aaa; white-space: nowrap; }
        .descanso-hora { color: #555; font-size: 11px; text-align: right; }
        .descanso-hora:not(:empty) { color: #777; }
        .logout {
          background: #1f1f1f; color: #fff; border: none;
          padding: 12px; border-radius: 8px; cursor: pointer; font-size: 13px;
        }

        .content { flex: 1; overflow-y: auto; padding: 40px; }
        .empty-state {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; height: 60vh; color: #555; text-align: center;
        }
        .empty-icon { font-size: 60px; margin-bottom: 16px; }
        .empty-state h2 { color: #888; margin-bottom: 8px; }

        .detalle { max-width: 860px; }
        .detalle-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          margin-bottom: 30px; flex-wrap: wrap; gap: 12px;
        }
        .detalle-header h1 { font-size: 36px; margin: 0; }
        .detalle-fecha { color: #777; margin: 4px 0 0; font-size: 15px; }
        .badge-grande {
          font-size: 14px; font-weight: 700; padding: 6px 16px;
          border-radius: 20px; white-space: nowrap;
        }

        .info-grid {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 16px; margin-bottom: 30px;
        }
        .info-card {
          background: #111; border: 1px solid #222; border-radius: 12px; padding: 16px;
        }
        .info-card-title { color: #4FC3F7; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 8px; }
        .info-linea { font-size: 14px; margin-bottom: 4px; }
        .muted { color: #666; font-size: 13px; }

        .seccion {
          background: #111; border: 1px solid #1f1f1f; border-radius: 14px;
          padding: 22px; margin-bottom: 20px;
        }
        .seccion h3 { margin: 0 0 14px; font-size: 16px; color: #ddd; }

        .servicios-lista { display: flex; flex-direction: column; gap: 8px; }
        .servicio-fila {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 12px; background: #1a1a1a; border-radius: 8px; font-size: 14px;
        }
        .servicio-total {
          text-align: right; color: #4FC3F7; font-weight: 700;
          margin-top: 10px; font-size: 15px;
        }
        .notas-cita {
          color: #888; font-size: 13px; margin-top: 10px;
          padding: 8px 12px; background: #1a1a1a; border-radius: 8px;
        }

        .textarea {
          width: 100%; background: #1a1a1a; border: 1px solid #333; color: white;
          padding: 12px; border-radius: 10px; font-size: 14px; resize: vertical;
          font-family: inherit; box-sizing: border-box;
        }
        .textarea:disabled { opacity: .6; cursor: default; }

        .fotos-seccion { margin-top: 14px; }
        .fotos-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 10px; font-size: 13px; color: #888;
        }
        .upload-botones { display: flex; gap: 8px; }
        .btn-upload {
          background: #1f2f3f; color: #4FC3F7; border: 1px solid #4FC3F755;
          padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .btn-upload-gal {
          background: #1a1a1a; color: #aaa; border: 1px solid #333;
          padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 13px;
        }
        .subiendo-txt { color: #4FC3F7; font-size: 13px; }
        .fotos-grid { display: flex; flex-wrap: wrap; gap: 10px; }
        .foto-thumb {
          width: 90px; height: 90px; object-fit: cover;
          border-radius: 8px; border: 1px solid #333;
        }

        .btn-guardar {
          background: #1a1a1a; color: #ccc; border: 1px solid #333;
          padding: 10px 20px; border-radius: 8px; cursor: pointer; margin-top: 14px;
          font-size: 14px;
        }
        .tiempos-lista { display: flex; flex-direction: column; gap: 8px; }
        .tiempo-fila {
          display: flex; justify-content: space-between; align-items: center;
          padding: 10px 14px; background: #1a1a1a; border-radius: 8px; gap: 12px;
          flex-wrap: wrap;
        }
        .tiempo-etiqueta { color: #888; font-size: 13px; }
        .tiempo-valor { font-size: 15px; font-weight: 700; color: #fff; }
        .tiempo-valor.verde { color: #22c55e; }
        .tiempo-pendiente { color: #444; font-size: 12px; font-style: italic; }
        .tiempo-vacio { color: #333; font-size: 14px; }
        .btn-tiempo {
          background: #1f2f3f; color: #4FC3F7; border: 1px solid #4FC3F755;
          padding: 6px 16px; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600;
        }
        .btn-tiempo.naranja { background: #2a1800; color: #fb923c; border-color: #fb923c55; }
        .btn-tiempo:disabled { opacity: .5; cursor: default; }
        .retraso-box {
          margin-top: 16px; padding: 14px; background: #1a1000;
          border: 1px solid #f59e0b44; border-radius: 10px;
        }
        .retraso-alerta { color: #f59e0b; font-size: 13px; font-weight: 600; }
        .campo-bloqueado {
          color: #22c55e; font-size: 12px; margin: 0 0 12px;
          padding: 5px 10px; background: #0a2a0a; border-radius: 6px;
          display: inline-block; border: 1px solid #22c55e33;
        }
        .campo-label-sm { color: #888; font-size: 12px; margin-bottom: 8px; }
        .protecciones-grupo { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn-prot {
          background: #1a1a1a; color: #777; border: 1px solid #333;
          padding: 8px 18px; border-radius: 8px; cursor: pointer; font-size: 14px;
          transition: .15s;
        }
        .btn-prot.activo { background: #0d2a1a; color: #22c55e; border-color: #22c55e55; font-weight: 700; }
        .btn-prot:disabled { opacity: .6; cursor: default; }
        .acabado-grupo { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn-acabado {
          background: #1a1a1a; color: #777; border: 1px solid #333;
          padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;
          transition: .15s;
        }
        .btn-acabado.sel { background: #0d2230; color: #4FC3F7; border-color: #4FC3F755; font-weight: 700; }
        .btn-acabado:disabled { opacity: .6; cursor: default; }
        .input-field {
          width: 100%; background: #1a1a1a; border: 1px solid #333; color: white;
          padding: 10px 12px; border-radius: 8px; font-size: 14px; box-sizing: border-box;
          font-family: inherit;
        }
        .input-field:disabled { opacity: .6; cursor: default; }
        .btn-accion {
          border: none; padding: 14px 28px; border-radius: 10px;
          cursor: pointer; font-size: 15px; font-weight: 700; margin-top: 8px;
        }
        .btn-accion.verde { background: #22c55e; color: #000; }
        .btn-accion.azul  { background: #3b82f6; color: #fff; }
        .btn-accion:disabled { opacity: .5; cursor: default; }

        .tipo-pago-opciones { display: flex; gap: 10px; flex-wrap: wrap; }
        .btn-tipo-pago {
          background: #1a1a1a; color: #888; border: 1px solid #333;
          padding: 8px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;
          transition: .15s;
        }
        .btn-tipo-pago.sel { background: #0d2230; color: #4FC3F7; border-color: #4FC3F7; font-weight: 700; }

        .firma-preview {
          max-width: 300px; border-radius: 8px;
          background: white; padding: 8px; border: 1px solid #333;
        }

        .completado-banner {
          background: #0d2a1a; border-color: #22c55e33;
          color: #22c55e; font-weight: 700; text-align: center; font-size: 16px;
        }

        @media (max-width: 900px) {
          .layout { flex-direction: column; }
          .sidebar { width: 100%; max-height: none; position: static; }
          .info-grid { grid-template-columns: 1fr; }
          .content { padding: 20px; }
        }
      `}</style>
    </main>
  )
}
