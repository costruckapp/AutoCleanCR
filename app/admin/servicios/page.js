'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../lib/supabase'

export default function ServiciosAdminPage() {
  const [servicios, setServicios] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)

  const [form, setForm] = useState({
    categoria: 'Lavados',
    nombre: '',
    descripcion: '',
    tipo_vehiculo: 'General',
    precio: '',
    duracion_minutos: '',
    requiere_domicilio: false,
    activo: true,
    orden: 0,
  })

  useEffect(() => {
    cargarServicios()
  }, [])

  async function cargarServicios() {
    setLoading(true)

    const { data, error } = await supabase
      .from('servicios')
      .select('*')
      .order('orden', { ascending: true })

    if (!error) {
      setServicios(data || [])
    }

    setLoading(false)
  }

  function abrirNuevo() {
    setEditando(null)
    setForm({
      categoria: 'Lavados',
      nombre: '',
      descripcion: '',
      tipo_vehiculo: 'General',
      precio: '',
      duracion_minutos: '',
      requiere_domicilio: false,
      activo: true,
      orden: 0,
    })
    setModal(true)
  }

  function abrirEditar(servicio) {
    setEditando(servicio.id)
    setForm({
      categoria: servicio.categoria || '',
      nombre: servicio.nombre || '',
      descripcion: servicio.descripcion || '',
      tipo_vehiculo: servicio.tipo_vehiculo || 'General',
      precio: servicio.precio || '',
      duracion_minutos: servicio.duracion_minutos || '',
      requiere_domicilio: servicio.requiere_domicilio || false,
      activo: servicio.activo,
      orden: servicio.orden || 0,
    })
    setModal(true)
  }

  async function guardarServicio() {
    if (!form.nombre || !form.categoria) {
      alert('Categoría y nombre son obligatorios.')
      return
    }

    const payload = {
      ...form,
      precio: Number(form.precio || 0),
      duracion_minutos: Number(form.duracion_minutos || 60),
      orden: Number(form.orden || 0),
    }

    let error

    if (editando) {
      const res = await supabase
        .from('servicios')
        .update(payload)
        .eq('id', editando)

      error = res.error
    } else {
      const res = await supabase
        .from('servicios')
        .insert([payload])

      error = res.error
    }

    if (error) {
      alert(error.message)
      return
    }

    setModal(false)
    cargarServicios()
  }

  async function cambiarEstado(servicio) {
    const { error } = await supabase
      .from('servicios')
      .update({ activo: !servicio.activo })
      .eq('id', servicio.id)

    if (error) {
      alert(error.message)
      return
    }

    cargarServicios()
  }

  async function eliminarServicio(id) {
    const confirmar = confirm('¿Seguro que querés eliminar este servicio?')

    if (!confirmar) return

    const { error } = await supabase
      .from('servicios')
      .delete()
      .eq('id', id)

    if (error) {
      alert(error.message)
      return
    }

    cargarServicios()
  }

  function actualizarCampo(campo, valor) {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  return (
    <main className="page">
      <div className="top">
        <div>
          <h1>Servicios</h1>
          <p>Administrá precios, categorías, duración y disponibilidad.</p>
        </div>

        <button className="primary" onClick={abrirNuevo}>
          + Nuevo servicio
        </button>
      </div>

      <section className="panel">
        {loading ? (
          <div className="loading">Cargando servicios...</div>
        ) : (
          <div className="table">
            <div className="header">
              <div>Categoría</div>
              <div>Servicio</div>
              <div>Vehículo</div>
              <div>Precio</div>
              <div>Duración</div>
              <div>Estado</div>
              <div>Acciones</div>
            </div>

            {servicios.map((servicio) => (
              <div className="row" key={servicio.id}>
                <div>{servicio.categoria}</div>

                <div>
                  <strong>{servicio.nombre}</strong>
                  <small>{servicio.descripcion}</small>
                </div>

                <div>{servicio.tipo_vehiculo}</div>

                <div>
                  ₡{Number(servicio.precio || 0).toLocaleString('es-CR')}
                </div>

                <div>{servicio.duracion_minutos} min</div>

                <div>
                  <span className={servicio.activo ? 'activo' : 'inactivo'}>
                    {servicio.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="acciones">
                  <button onClick={() => abrirEditar(servicio)}>
                    Editar
                  </button>

                  <button onClick={() => cambiarEstado(servicio)}>
                    {servicio.activo ? 'Desactivar' : 'Activar'}
                  </button>

                  <button className="danger" onClick={() => eliminarServicio(servicio.id)}>
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {modal && (
        <div className="modal-bg">
          <div className="modal">
            <h2>{editando ? 'Editar servicio' : 'Nuevo servicio'}</h2>

            <select
              value={form.categoria}
              onChange={(e) => actualizarCampo('categoria', e.target.value)}
            >
              <option value="Lavados">Lavados</option>
              <option value="Interior">Interior</option>
              <option value="Detallado">Detallado</option>
              <option value="Protección">Protección</option>
              <option value="PPF">PPF</option>
              <option value="Otros">Otros</option>
            </select>

            <input
              placeholder="Nombre del servicio"
              value={form.nombre}
              onChange={(e) => actualizarCampo('nombre', e.target.value)}
            />

            <textarea
              placeholder="Descripción"
              value={form.descripcion}
              onChange={(e) => actualizarCampo('descripcion', e.target.value)}
            />

            <select
              value={form.tipo_vehiculo}
              onChange={(e) => actualizarCampo('tipo_vehiculo', e.target.value)}
            >
              <option value="General">General</option>
              <option value="Sedan">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="Pick Up">Pick Up</option>
              <option value="XL">XL</option>
            </select>

            <input
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={(e) => actualizarCampo('precio', e.target.value)}
            />

            <input
              type="number"
              placeholder="Duración en minutos"
              value={form.duracion_minutos}
              onChange={(e) => actualizarCampo('duracion_minutos', e.target.value)}
            />

            <input
              type="number"
              placeholder="Orden"
              value={form.orden}
              onChange={(e) => actualizarCampo('orden', e.target.value)}
            />

            <label className="check">
              <input
                type="checkbox"
                checked={form.requiere_domicilio}
                onChange={(e) => actualizarCampo('requiere_domicilio', e.target.checked)}
              />
              Requiere domicilio
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={form.activo}
                onChange={(e) => actualizarCampo('activo', e.target.checked)}
              />
              Servicio activo
            </label>

            <div className="modal-actions">
              <button onClick={guardarServicio}>
                Guardar
              </button>

              <button className="cancelar" onClick={() => setModal(false)}>
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
          gap: 20px;
          margin-bottom: 30px;
        }

        h1 {
          font-size: 44px;
          margin-bottom: 8px;
        }

        p {
          color: #777;
        }

        .primary {
          background: #4FC3F7;
          color: black;
          border: none;
          padding: 14px 22px;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .panel {
          background: #111;
          border: 1px solid #222;
          border-radius: 22px;
          overflow: hidden;
        }

        .table {
          width: 100%;
        }

        .header,
        .row {
          display: grid;
          grid-template-columns: 1fr 1.5fr .8fr .8fr .8fr .8fr 1.5fr;
          gap: 16px;
          align-items: center;
          padding: 18px 22px;
        }

        .header {
          background: #0d0d0d;
          color: #777;
          font-weight: 900;
          border-bottom: 1px solid #222;
        }

        .row {
          border-bottom: 1px solid #222;
        }

        .row:last-child {
          border-bottom: none;
        }

        small {
          display: block;
          color: #777;
          margin-top: 6px;
        }

        .activo,
        .inactivo {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .activo {
          background: #0d2a12;
          color: #6dff91;
        }

        .inactivo {
          background: #2a1010;
          color: #ff8080;
        }

        .acciones {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .acciones button {
          background: #1f1f1f;
          border: 1px solid #333;
          color: white;
          padding: 9px 12px;
          border-radius: 10px;
          cursor: pointer;
        }

        .acciones .danger {
          background: #2a1010;
          color: #ff8080;
        }

        .loading {
          padding: 40px;
          color: #777;
          text-align: center;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 560px;
          background: #111;
          border: 1px solid #222;
          border-radius: 22px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .modal h2 {
          margin-bottom: 10px;
        }

        input,
        select,
        textarea {
          background: #1a1a1a;
          border: 1px solid #333;
          color: white;
          padding: 15px;
          border-radius: 12px;
        }

        textarea {
          min-height: 90px;
          resize: vertical;
        }

        .check {
          display: flex;
          gap: 10px;
          align-items: center;
          color: #ccc;
        }

        .check input {
          width: auto;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 10px;
        }

        .modal-actions button {
          flex: 1;
          border: none;
          padding: 15px;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .modal-actions button:first-child {
          background: #4FC3F7;
          color: black;
        }

        .cancelar {
          background: #222 !important;
          color: white !important;
        }

        @media (max-width: 1100px) {
          .header {
            display: none;
          }

          .row {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }

          .top {
            flex-direction: column;
            align-items: flex-start;
          }

          .page {
            padding: 20px;
          }
        }
      `}</style>
    </main>
  )
}