'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase'

const tiposVehiculo = ['Sedan', 'SUV', 'Pick Up', 'XL']

const UBICACIONES = {
  'San José': {
    'San José': ['Carmen', 'Merced', 'Hospital', 'Catedral', 'Zapote', 'San Francisco de Dos Ríos', 'Uruca', 'Mata Redonda', 'Pavas', 'Hatillo', 'San Sebastián'],
    'Escazú': ['Escazú', 'San Antonio', 'San Rafael'],
    'Desamparados': ['Desamparados', 'San Miguel', 'San Juan de Dios', 'San Rafael Arriba', 'San Antonio', 'Frailes', 'Patarrá', 'San Cristóbal', 'Rosario', 'Damas', 'San Rafael Abajo', 'Gravilias', 'Los Guido'],
    'Puriscal': ['Santiago', 'Mercedes Sur', 'Barbacoas', 'Grifo Alto', 'San Rafael', 'Candelarita', 'Desamparaditos', 'San Antonio', 'Chires'],
    'Tarrazú': ['San Marcos', 'San Lorenzo', 'San Carlos'],
    'Aserrí': ['Aserrí', 'Tarbaca', 'Vuelta de Jorco', 'San Gabriel', 'La Legua', 'Monterrey', 'Salitrillos'],
    'Mora': ['Colón', 'Guayabo', 'Tabarcia', 'Piedras Negras', 'Picagres', 'Jaris', 'Quitirrisí'],
    'Goicoechea': ['Guadalupe', 'San Francisco', 'Calle Blancos', 'Mata de Plátano', 'Ipís', 'Rancho Redondo', 'Purral'],
    'Santa Ana': ['Santa Ana', 'Salitral', 'Pozos', 'Uruca', 'Piedades', 'Brasil'],
    'Alajuelita': ['Alajuelita', 'San Josecito', 'San Antonio', 'Concepción', 'San Felipe'],
    'Vásquez de Coronado': ['San Isidro', 'San Rafael', 'Dulce Nombre de Jesús', 'Patalillo', 'Cascajal'],
    'Acosta': ['San Ignacio', 'Guaitil', 'Palmichal', 'Cangrejal', 'Sabanillas'],
    'Tibás': ['San Juan', 'Cinco Esquinas', 'Anselmo Llorente', 'León XIII', 'Colima'],
    'Moravia': ['San Vicente', 'San Jerónimo', 'La Trinidad'],
    'Montes de Oca': ['San Pedro', 'Sabanilla', 'Mercedes', 'San Rafael'],
    'Turrubares': ['San Pablo', 'San Pedro', 'San Juan de Mata', 'San Luis', 'Carara'],
    'Dota': ['Santa María', 'Jardín', 'Copey'],
    'Curridabat': ['Curridabat', 'Granadilla', 'Sánchez', 'Tirrases'],
    'Pérez Zeledón': ['San Isidro de El General', 'El General', 'Daniel Flores', 'Rivas', 'San Pedro', 'Platanares', 'Pejibaye', 'Cajón', 'Barú', 'Río Nuevo', 'Páramo', 'La Amistad'],
    'León Cortés Castro': ['San Pablo', 'San Andrés', 'Llano Bonito', 'San Isidro', 'Santa Cruz', 'San Antonio'],
  },
  'Alajuela': {
    'Alajuela': ['Alajuela', 'San José', 'Carrizal', 'San Antonio', 'Guácima', 'San Isidro', 'Sabanilla', 'San Rafael', 'Río Segundo', 'Desamparados', 'Turrúcares', 'Tambor', 'Garita', 'Sarapiquí'],
    'San Ramón': ['San Ramón', 'Santiago', 'San Juan', 'Piedades Norte', 'Piedades Sur', 'San Rafael', 'San Isidro', 'Ángeles', 'Alfaro', 'Volio', 'Concepción', 'Zapotal', 'Peñas Blancas', 'San Lorenzo'],
    'Grecia': ['Grecia', 'San Isidro', 'San José', 'San Roque', 'Tacares', 'Río Cuarto', 'Puente de Piedra', 'Bolívar'],
    'San Mateo': ['San Mateo', 'Desmonte', 'Jesús María', 'Labrador'],
    'Atenas': ['Atenas', 'Jesús', 'Mercedes', 'San Isidro', 'Concepción', 'San José', 'Santa Eulalia', 'Escobal'],
    'Naranjo': ['Naranjo', 'San Miguel', 'San José', 'Cirrí Sur', 'San Jerónimo', 'San Juan', 'El Rosario', 'Palmitos'],
    'Palmares': ['Palmares', 'Zaragoza', 'Buenos Aires', 'Santiago', 'Candelaria', 'Esquipulas', 'La Granja'],
    'Poás': ['San Juan', 'San Luis', 'Carrillos', 'Sabana Redonda'],
    'Orotina': ['Orotina', 'El Mastate', 'Hacienda Vieja', 'Coyolar', 'La Ceiba'],
    'San Carlos': ['Ciudad Quesada', 'Florencia', 'Buenavista', 'Aguas Zarcas', 'Venecia', 'Pital', 'La Fortuna', 'La Tigra', 'La Palmera', 'Venado', 'Cutris', 'Monterrey', 'Pocosol'],
    'Zarcero': ['Zarcero', 'Laguna', 'Tapesco', 'Guadalupe', 'Palmira', 'Zapote', 'Brisas'],
    'Valverde Vega': ['Sarchí Norte', 'Sarchí Sur', 'Toro Amarillo', 'San Pedro', 'Rodríguez'],
    'Upala': ['Upala', 'Aguas Claras', 'San José (Pizote)', 'Bijagua', 'Delicias', 'Dos Ríos', 'Yolillal', 'Canalete'],
    'Los Chiles': ['Los Chiles', 'Caño Negro', 'El Amparo', 'San Jorge'],
    'Guatuso': ['San Rafael', 'Buenavista', 'Cote', 'Katira'],
    'Río Cuarto': ['Río Cuarto', 'Santa Rita', 'Santa Isabel'],
  },
  'Cartago': {
    'Cartago': ['Oriental', 'Occidental', 'Carmen', 'San Nicolás', 'Aguacaliente', 'Guadalupe', 'Corralillo', 'Tierra Blanca', 'Dulce Nombre', 'Llano Grande', 'Quebradilla'],
    'Paraíso': ['Paraíso', 'Santiago', 'Orosi', 'Cachí', 'Llanos de Santa Lucía'],
    'La Unión': ['Tres Ríos', 'San Diego', 'San Juan', 'San Rafael', 'Concepción', 'Dulce Nombre', 'San Ramón', 'Río Azul'],
    'Jiménez': ['Juan Viñas', 'Tucurrique', 'Pejibaye'],
    'Turrialba': ['Turrialba', 'La Suiza', 'Peralta', 'Santa Cruz', 'Santa Teresita', 'Pavones', 'Tuis', 'Tayutic', 'Santa Rosa', 'Tres Equis', 'La Isabel', 'Chirripó'],
    'Alvarado': ['Pacayas', 'Cervantes', 'Capellades'],
    'Oreamuno': ['San Rafael', 'Cot', 'Potrero Cerrado', 'Cipreses', 'Santa Rosa'],
    'El Guarco': ['El Tejar', 'San Isidro', 'Tobosi', 'Patio de Agua'],
  },
  'Heredia': {
    'Heredia': ['Heredia', 'Mercedes', 'San Francisco', 'Ulloa', 'Varablanca'],
    'Barva': ['Barva', 'San Pedro', 'San Pablo', 'San Roque', 'Santa Lucía', 'San José de la Montaña'],
    'Santo Domingo': ['Santo Domingo', 'San Vicente', 'San Miguel', 'Paracito', 'Santo Tomás', 'Santa Rosa', 'Tures', 'Pará'],
    'Santa Bárbara': ['Santa Bárbara', 'San Pedro', 'San Juan', 'Jesús', 'Santo Domingo', 'Puraba'],
    'San Rafael': ['San Rafael', 'San Josecito', 'Santiago', 'Ángeles', 'Concepción'],
    'San Isidro': ['San Isidro', 'San José', 'Concepción', 'San Francisco'],
    'Belén': ['San Antonio', 'La Ribera', 'La Asunción'],
    'Flores': ['San Joaquín', 'Barrantes', 'Llorente'],
    'San Pablo': ['San Pablo', 'Rincón de Sabanilla'],
    'Sarapiquí': ['Puerto Viejo', 'La Virgen', 'Las Horquetas', 'Llanuras del Gaspar', 'Cureña'],
  },
  'Guanacaste': {
    'Liberia': ['Liberia', 'Cañas Dulces', 'Mayorga', 'Nacascolo', 'Curubandé'],
    'Nicoya': ['Nicoya', 'Mansión', 'San Antonio', 'Quebrada Honda', 'Sámara', 'Nosara', 'Belén de Nosarita'],
    'Santa Cruz': ['Santa Cruz', 'Bolsón', 'Veintisiete de Abril', 'Tempate', 'Cartagena', 'Cuajiniquil', 'Diriá', 'Cabo Velas', 'Tamarindo'],
    'Bagaces': ['Bagaces', 'La Fortuna', 'Mogote', 'Río Naranjo'],
    'Carrillo': ['Filadelfia', 'Palmira', 'Sardinal', 'Belén'],
    'Cañas': ['Cañas', 'Palmira', 'San Miguel', 'Bebedero', 'Porozal'],
    'Abangares': ['Las Juntas', 'Sierra', 'San Juan', 'Colorado'],
    'Tilarán': ['Tilarán', 'Quebrada Grande', 'Tronadora', 'Santa Rosa', 'Líbano', 'Tierras Morenas', 'Arenal', 'Cabeceras'],
    'Nandayure': ['Carmona', 'Santa Rita', 'Zapotal', 'San Pablo', 'Porvenir', 'Bejuco'],
    'La Cruz': ['La Cruz', 'Santa Cecilia', 'La Garita', 'Santa Elena'],
    'Hojancha': ['Hojancha', 'Monte Romo', 'Puerto Carrillo', 'Huacas', 'Matambú'],
  },
  'Puntarenas': {
    'Puntarenas': ['Puntarenas', 'Pitahaya', 'Chomes', 'Lepanto', 'Paquera', 'Manzanillo', 'Guacimal', 'Barranca', 'Acapulco', 'El Roble', 'Chacarita', 'El Porvenir', 'Moctezuma', 'Pachote', 'Monteverde'],
    'Esparza': ['Espíritu Santo', 'San Juan Grande', 'Macacona', 'San Rafael', 'San Jerónimo', 'Caldera'],
    'Buenos Aires': ['Buenos Aires', 'Volcán', 'Potrero Grande', 'Boruca', 'Pilas', 'Colinas', 'Chánguena', 'Biolley', 'Brunka'],
    'Montes de Oro': ['Miramar', 'La Unión', 'San Isidro'],
    'Osa': ['Puerto Cortés', 'Palmar', 'Sierpe', 'Bahía Ballena', 'Piedras Blancas', 'Bahía Drake'],
    'Quepos': ['Quepos', 'Savegre', 'Naranjito'],
    'Golfito': ['Golfito', 'Puerto Jiménez', 'Guaycará', 'Pavón'],
    'Coto Brus': ['San Vito', 'Sabalito', 'Aguabuena', 'Limoncito', 'Pittier', 'Gutiérrez Braun'],
    'Parrita': ['Parrita'],
    'Corredores': ['Corredor', 'La Cuesta', 'Canoas', 'Laurel'],
    'Garabito': ['Jacó', 'Tárcoles', 'Lagunillas'],
  },
  'Limón': {
    'Limón': ['Limón', 'Valle La Estrella', 'Río Blanco', 'Matama'],
    'Pococí': ['Guápiles', 'Jiménez', 'Rita', 'Roxana', 'Cariari', 'Colorado', 'La Colonia'],
    'Siquirres': ['Siquirres', 'Pacuarito', 'Florida', 'Germania', 'Cairo', 'Alegría', 'Reventazón'],
    'Talamanca': ['Bratsi', 'Sixaola', 'Cahuita', 'Telire'],
    'Matina': ['Matina', 'Batán', 'Carrandi'],
    'Guácimo': ['Guácimo', 'Mercedes', 'Pocora', 'Río Jiménez', 'Duacarí'],
  },
}

export default function ClientePage() {
  const router = useRouter()

  const [perfil, setPerfil] = useState(null)
  const [vehiculos, setVehiculos] = useState([])
  const [servicios, setServicios] = useState([])
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)

  const [mostrarVehiculo, setMostrarVehiculo] = useState(false)
  const [mostrarCita, setMostrarCita] = useState(false)

  const [marca, setMarca] = useState('')
  const [modelo, setModelo] = useState('')
  const [anio, setAnio] = useState('')
  const [placa, setPlaca] = useState('')
  const [color, setColor] = useState('')
  const [tipo, setTipo] = useState('Sedan')
  const [ppf, setPpf] = useState(false)
  const [ceramico, setCeramico] = useState(false)
  const [wrap, setWrap] = useState(false)
  const [notasVehiculo, setNotasVehiculo] = useState('')

  const [vehiculoId, setVehiculoId] = useState('')
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([])
  const [fecha, setFecha] = useState('')
  const [hora, setHora] = useState('')
  const [notasCita, setNotasCita] = useState('')

  const [provinciaCita, setProvinciaCita] = useState('')
  const [cantonCita, setCantonCita] = useState('')
  const [distritoCita, setDistritoCita] = useState('')
  const [direccionCita, setDireccionCita] = useState('')

  const [seccion, setSeccion] = useState('dashboard')

  const [editandoPerfil, setEditandoPerfil] = useState(false)
  const [nombreEdit, setNombreEdit] = useState('')
  const [telefonoEdit, setTelefonoEdit] = useState('')
  const [provinciaEdit, setProvinciaEdit] = useState('')
  const [cantonEdit, setCantonEdit] = useState('')
  const [distritoEdit, setDistritoEdit] = useState('')
  const [direccionEdit, setDireccionEdit] = useState('')

  const [slotsDisponibles, setSlotsDisponibles] = useState([])
  const [cargandoSlots, setCargandoSlots] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [citaEditando, setCitaEditando] = useState(null)
  const [fechaEdit, setFechaEdit] = useState('')
  const [horaEdit, setHoraEdit] = useState('')
  const [provinciaEditCita, setProvinciaEditCita] = useState('')
  const [cantonEditCita, setCantonEditCita] = useState('')
  const [distritoEditCita, setDistritoEditCita] = useState('')
  const [direccionEditCita, setDireccionEditCita] = useState('')
  const [notasEditCita, setNotasEditCita] = useState('')
  const [serviciosEditCita, setServiciosEditCita] = useState([])

  useEffect(() => {
    cargarDatos()
  }, [])

  const vehiculoSeleccionado = useMemo(() => {
    return vehiculos.find((v) => v.id === vehiculoId)
  }, [vehiculos, vehiculoId])

  const serviciosFiltrados = useMemo(() => {
    if (!vehiculoSeleccionado) return []

    const normalizar = (valor) =>
      String(valor || '')
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')

    const tipoVehiculo = normalizar(vehiculoSeleccionado.tipo)

    return servicios.filter((servicio) => {
      const tipoServicio = normalizar(servicio.tipo_vehiculo)

      return (
        tipoServicio === 'general' ||
        tipoServicio === tipoVehiculo
      )
    })
  }, [servicios, vehiculoSeleccionado])

  const vehiculoEditando = useMemo(() => {
    if (!citaEditando) return null
    return vehiculos.find((v) => v.id === citaEditando.vehiculo_id)
  }, [vehiculos, citaEditando])

  const serviciosFiltradosEdit = useMemo(() => {
    if (!vehiculoEditando) return []
    const normalizar = (v) => String(v || '').trim().toLowerCase().replace(/\s+/g, ' ')
    const tipo = normalizar(vehiculoEditando.tipo)
    return servicios.filter((s) => {
      const t = normalizar(s.tipo_vehiculo)
      return t === 'general' || t === tipo
    })
  }, [servicios, vehiculoEditando])

  const resumenServiciosEdit = useMemo(() => {
    const seleccionados = servicios.filter((s) => serviciosEditCita.includes(s.id))
    return {
      total: seleccionados.reduce((sum, s) => sum + Number(s.precio || 0), 0),
      duracion: seleccionados.reduce((sum, s) => sum + Number(s.duracion_minutos || 0), 0),
    }
  }, [servicios, serviciosEditCita])

  const resumenServicios = useMemo(() => {
    const seleccionados = servicios.filter((s) =>
      serviciosSeleccionados.includes(s.id)
    )

    const total = seleccionados.reduce(
      (sum, item) => sum + Number(item.precio || 0),
      0
    )

    const duracion = seleccionados.reduce(
      (sum, item) => sum + Number(item.duracion_minutos || 0),
      0
    )

    return {
      seleccionados,
      total,
      duracion,
    }
  }, [servicios, serviciosSeleccionados])

  async function cargarDatos() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { data: perfilData } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', user.id)
      .single()

    setPerfil(perfilData)

    setProvinciaCita(perfilData?.provincia || '')
    setCantonCita(perfilData?.canton || '')
    setDistritoCita(perfilData?.distrito || '')
    setDireccionCita(perfilData?.direccion_detallada || '')

    const { data: vehiculosData } = await supabase
      .from('vehiculos')
      .select('*')
      .eq('cliente_id', user.id)
      .order('created_at', { ascending: false })

    setVehiculos(vehiculosData || [])

    const { data: serviciosData } = await supabase
      .from('servicios')
      .select('*')
      .eq('activo', true)
      .order('orden', { ascending: true })

    setServicios(serviciosData || [])

    const { data: citasData } = await supabase
      .from('citas')
      .select(`
        *,
        vehiculos (
          marca,
          modelo,
          placa,
          tipo
        ),
        cita_servicios (
          id,
          servicio_id,
          precio,
          duracion_minutos,
          servicios (
            nombre,
            tipo_vehiculo
          )
        )
      `)
      .eq('cliente_id', user.id)
      .order('fecha', { ascending: true })

    let citasConBoleta = citasData || []
    if (citasData && citasData.length > 0) {
      try {
        const ids = citasData.map(c => c.id).join(',')
        const bRes = await fetch(`/api/boletas/summary?cita_ids=${ids}`)
        if (bRes.ok) {
          const bJson = await bRes.json()
          const byId = {}
          for (const b of (bJson.boletas || [])) {
            if (b.cita_id) byId[b.cita_id] = b
          }
          citasConBoleta = citasData.map(c => ({ ...c, boleta: byId[c.id] || null }))
        }
      } catch (e) {
        console.error('Error cargando resumen de boletas:', e.message)
      }
    }
    setCitas(citasConBoleta)

    setLoading(false)
  }

  async function cerrarSesion() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  async function guardarVehiculo() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase.from('vehiculos').insert([
      {
        cliente_id: user.id,
        marca,
        modelo,
        anio,
        placa,
        color,
        tipo,
        tiene_ppf: ppf,
        tiene_ceramico: ceramico,
        tiene_wrap: wrap,
        notas: notasVehiculo,
      },
    ])

    if (error) {
      alert(error.message)
      return
    }

    setMostrarVehiculo(false)
    setMarca('')
    setModelo('')
    setAnio('')
    setPlaca('')
    setColor('')
    setTipo('Sedan')
    setPpf(false)
    setCeramico(false)
    setWrap(false)
    setNotasVehiculo('')

    cargarDatos()
  }

  function toggleServicio(id) {
    setServiciosSeleccionados((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      }

      return [...prev, id]
    })
  }

  function abrirPerfil() {
    setNombreEdit(perfil?.nombre || '')
    setTelefonoEdit(perfil?.telefono || '')
    setProvinciaEdit(perfil?.provincia || '')
    setCantonEdit(perfil?.canton || '')
    setDistritoEdit(perfil?.distrito || '')
    setDireccionEdit(perfil?.direccion_detallada || '')
    setEditandoPerfil(false)
    setSeccion('perfil')
  }

  async function guardarPerfil() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('perfiles')
      .update({
        nombre: nombreEdit,
        telefono: telefonoEdit,
        provincia: provinciaEdit,
        canton: cantonEdit,
        distrito: distritoEdit,
        direccion_detallada: direccionEdit,
      })
      .eq('id', user.id)

    if (error) {
      alert(error.message)
      return
    }

    setEditandoPerfil(false)
    cargarDatos()
  }

  function abrirEditarCita(cita) {
    setCitaEditando(cita)
    setFechaEdit(cita.fecha)
    setHoraEdit(cita.hora)
    setProvinciaEditCita(cita.provincia || '')
    setCantonEditCita(cita.canton || '')
    setDistritoEditCita(cita.distrito || '')
    setDireccionEditCita(cita.direccion_detallada || '')
    setNotasEditCita(cita.notas || '')
    setServiciosEditCita(cita.cita_servicios?.map((cs) => cs.servicio_id) || [])
  }

  function toggleServicioEdit(id) {
    setServiciosEditCita((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function guardarModificacionCita() {
    if (!citaEditando) return
    if (serviciosEditCita.length === 0 || !fechaEdit || !horaEdit) {
      alert('Completá todos los campos requeridos.')
      return
    }

    const { error: citaError } = await supabase
      .from('citas')
      .update({
        fecha: fechaEdit,
        hora: horaEdit,
        provincia: provinciaEditCita,
        canton: cantonEditCita,
        distrito: distritoEditCita,
        direccion_detallada: direccionEditCita,
        notas: notasEditCita,
      })
      .eq('id', citaEditando.id)

    if (citaError) {
      alert(citaError.message)
      return
    }

    await supabase.from('cita_servicios').delete().eq('cita_id', citaEditando.id)

    const seleccionados = servicios.filter((s) => serviciosEditCita.includes(s.id))
    await supabase.from('cita_servicios').insert(
      seleccionados.map((s) => ({
        cita_id: citaEditando.id,
        servicio_id: s.id,
        precio: s.precio || 0,
        duracion_minutos: s.duracion_minutos || 0,
      }))
    )

    alert('Cita actualizada correctamente.')
    setCitaEditando(null)
    cargarDatos()
  }

  function abrirCita() {
    if (vehiculos.length > 0) {
      setVehiculoId(vehiculos[0].id)
    }

    setServiciosSeleccionados([])
    setFecha('')
    setHora('')
    setNotasCita('')
    setSlotsDisponibles([])

    setProvinciaCita(perfil?.provincia || '')
    setCantonCita(perfil?.canton || '')
    setDistritoCita(perfil?.distrito || '')
    setDireccionCita(perfil?.direccion_detallada || '')

    setMostrarCita(true)
  }

  async function consultarDisponibilidad() {
    if (!fecha) return
    setCargandoSlots(true)
    setSlotsDisponibles([])
    setHora('')

    try {
      const res = await fetch('/api/disponibilidad', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fecha,
          provincia: provinciaCita,
          canton: cantonCita,
          direccion: direccionCita,
          duracion: resumenServicios.duracion || 60,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setSlotsDisponibles(data.slots || [])
    } catch (e) {
      alert('Error consultando disponibilidad: ' + e.message)
    } finally {
      setCargandoSlots(false)
    }
  }

  async function guardarCita() {
    if (submitting) return
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    if (!vehiculoId || serviciosSeleccionados.length === 0 || !fecha || !hora) {
      alert('Seleccioná vehículo, al menos un servicio, fecha y hora.')
      return
    }

    setSubmitting(true)

    const { data: citaNueva, error: citaError } = await supabase
      .from('citas')
      .insert([
        {
          cliente_id: user.id,
          vehiculo_id: vehiculoId,
          fecha,
          hora,
          modalidad: 'domicilio',
          provincia: provinciaCita,
          canton: cantonCita,
          distrito: distritoCita,
          direccion_detallada: direccionCita,
          zona_operativa: perfil?.zona_operativa || '',
          estado: 'pendiente',
          notas: notasCita,
        },
      ])
      .select()
      .single()

    if (citaError) {
      alert(citaError.message)
      setSubmitting(false)
      return
    }

    const serviciosParaInsertar = resumenServicios.seleccionados.map(
      (servicio) => ({
        cita_id: citaNueva.id,
        servicio_id: servicio.id,
        precio: servicio.precio || 0,
        duracion_minutos: servicio.duracion_minutos || 0,
      })
    )

    const { error: serviciosError } = await supabase
      .from('cita_servicios')
      .insert(serviciosParaInsertar)

    if (serviciosError) {
      alert(serviciosError.message)
      setSubmitting(false)
      return
    }

    // Crear boleta de servicio
    try {
      const boletaRes = await fetch('/api/boletas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cita_id: citaNueva.id }),
      })
      const boletaJson = await boletaRes.json()
      if (boletaJson.error) console.error('Error al crear boleta:', boletaJson.error)
    } catch (e) {
      console.error('Error al crear boleta:', e.message)
    }

    // Notificar a N8N → Kommo (no bloquea si falla)
    try {
      const n8nCitaUrl = process.env.NEXT_PUBLIC_N8N_NUEVA_CITA
      if (n8nCitaUrl) {
        await fetch(n8nCitaUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cita_id: citaNueva.id,
            cliente_nombre: perfil?.nombre || '',
            cliente_telefono: perfil?.telefono || '',
            cliente_email: perfil?.email || '',
            fecha,
            hora,
            servicios: resumenServicios.seleccionados.map((s) => s.nombre).join(', '),
            vehiculo: `${vehiculoSeleccionado?.marca || ''} ${vehiculoSeleccionado?.modelo || ''} (${vehiculoSeleccionado?.placa || ''})`,
            placa: vehiculoSeleccionado?.placa || '',
            modalidad: 'domicilio',
            direccion: `${distritoCita}, ${cantonCita}, ${provinciaCita}`,
          }),
        })
      }
    } catch (e) {
      console.error('Error notificando a N8N (cita nueva):', e.message)
    }

    // Crear evento en Google Calendar (no bloquea si falla)
    try {
      await fetch('/api/evento-calendario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cita_id: citaNueva.id,
          titulo: `AutoClean · ${vehiculoSeleccionado?.marca} ${vehiculoSeleccionado?.modelo} (${vehiculoSeleccionado?.placa})`,
          fecha,
          hora,
          duracionMinutos: resumenServicios.duracion || 60,
          descripcion: `Cliente: ${perfil?.nombre}\nServicios: ${resumenServicios.seleccionados.map((s) => s.nombre).join(', ')}\nNotas: ${notasCita}`,
          ubicacion: `${distritoCita}, ${cantonCita}, ${provinciaCita}, Costa Rica`,
        }),
      })
    } catch (e) {
      console.error('Error al crear evento en calendario:', e.message)
    }

    alert('Cita solicitada correctamente.')

    setMostrarCita(false)
    setVehiculoId('')
    setServiciosSeleccionados([])
    setFecha('')
    setHora('')
    setNotasCita('')
    setSlotsDisponibles([])
    setSubmitting(false)

    cargarDatos()
  }

  if (loading) {
    return (
      <main className="loading">
        Cargando portal cliente...
      </main>
    )
  }

  return (
    <main className="page">
      <aside className="sidebar">
        <img src="/logo-png.png" alt="AutoClean CR" className="logo" />
        <p className="rol">CLIENTE</p>

        <nav>
          <button
            className={seccion === 'dashboard' ? 'active' : ''}
            onClick={() => setSeccion('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={seccion === 'modificar-cita' ? 'active' : ''}
            onClick={() => setSeccion('modificar-cita')}
          >
            Modificar cita
          </button>
          <button
            className={seccion === 'perfil' ? 'active' : ''}
            onClick={abrirPerfil}
          >
            Mi perfil
          </button>
        </nav>

        <button className="logout" onClick={cerrarSesion}>
          Cerrar sesión
        </button>
      </aside>

      <section className="content">
        <div className="top">
          <div>
            <h1>Hola {perfil?.nombre?.split(' ')[0]}</h1>
            <p>Bienvenido al portal AutoClean CR</p>
          </div>

          {seccion === 'dashboard' && (
            <div className="top-actions">
              <button
                className="outline-btn"
                onClick={() => setMostrarVehiculo(true)}
              >
                + Agregar vehículo
              </button>

              <button className="nuevo-btn" onClick={abrirCita}>
                + Agendar cita
              </button>
            </div>
          )}
        </div>

        {seccion === 'dashboard' && (
          <>
            <div className="cards">
              <div className="card">
                <h3>Vehículos</h3>
                <span>{vehiculos.length}</span>
              </div>

              <div className="card">
                <h3>Zona</h3>
                <span>{perfil?.zona_operativa || 'Sin zona'}</span>
              </div>

              <div className="card">
                <h3>Citas</h3>
                <span>{citas.length}</span>
              </div>
            </div>

            <div className="section">
              <div className="section-top">
                <h2>Mis vehículos</h2>
              </div>

              {vehiculos.length === 0 ? (
                <div className="empty">No tienes vehículos registrados.</div>
              ) : (
                <div className="vehiculos-grid">
                  {vehiculos.map((vehiculo) => (
                    <div key={vehiculo.id} className="vehiculo-card">
                      <div className="vehiculo-top">
                        <h3>{vehiculo.marca} {vehiculo.modelo}</h3>
                        <span className="tipo">{vehiculo.tipo}</span>
                      </div>

                      <div className="info">
                        <div><strong>Placa:</strong> {vehiculo.placa}</div>
                        <div><strong>Año:</strong> {vehiculo.anio}</div>
                        <div><strong>Color:</strong> {vehiculo.color}</div>
                      </div>

                      <div className="badges">
                        {vehiculo.tiene_ppf && <span className="badge ppf">PPF</span>}
                        {vehiculo.tiene_ceramico && <span className="badge ceramic">Cerámico</span>}
                        {vehiculo.tiene_wrap && <span className="badge wrap">Wrap</span>}
                      </div>

                      {vehiculo.notas && <div className="notas">{vehiculo.notas}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="section citas-section">
              <div className="section-top">
                <h2>Mis citas</h2>
              </div>

              {citas.length === 0 ? (
                <div className="empty">No tienes citas registradas.</div>
              ) : (
                <div className="citas-grid">
                  {citas.map((cita) => (
                    <div className="cita-card" key={cita.id}>
                      <div className="cita-head">
                        <strong>{cita.fecha} · {cita.hora}</strong>
                        <span>{cita.estado}</span>
                      </div>

                      <div className="info">
                        <div><strong>Vehículo:</strong> {cita.vehiculos?.marca} {cita.vehiculos?.modelo} · {cita.vehiculos?.placa}</div>
                        <div><strong>Dirección:</strong> {cita.direccion_detallada}</div>
                        <div><strong>Zona:</strong> {cita.zona_operativa || 'Sin zona'}</div>
                      </div>

                      <div className="servicios-cita">
                        {cita.cita_servicios?.map((item) => (
                          <div key={item.id} className="servicio-mini">
                            {item.servicios?.nombre} · ₡{Number(item.precio || 0).toLocaleString('es-CR')}
                          </div>
                        ))}
                      </div>

                      {cita.boleta?.firma_inicio && (
                        <div className="boleta-detalles">
                          <div className="boleta-detalles-titulo">Registrado por el colaborador</div>
                          <div className="prot-badges">
                            {cita.boleta.tiene_ceramico && <span className="bd-badge bd-ceramic">Cerámico</span>}
                            {cita.boleta.tiene_ppf && <span className="bd-badge bd-ppf">PPF</span>}
                            {cita.boleta.tiene_wrap && <span className="bd-badge bd-wrap">Wrap</span>}
                            {!cita.boleta.tiene_ceramico && !cita.boleta.tiene_ppf && !cita.boleta.tiene_wrap && (
                              <span className="bd-badge bd-ninguno">Sin protecciones</span>
                            )}
                          </div>
                          {cita.boleta.acabado_interno && (
                            <div className="bd-info">
                              Acabado: {cita.boleta.acabado_interno.charAt(0).toUpperCase() + cita.boleta.acabado_interno.slice(1)}
                            </div>
                          )}
                          {cita.boleta.aroma && <div className="bd-info">Aroma: {cita.boleta.aroma}</div>}
                          {cita.boleta.notas_colaborador && (
                            <div className="bd-info bd-notas">{cita.boleta.notas_colaborador}</div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {seccion === 'modificar-cita' && (
          <div className="section">
            <h2>Modificar cita</h2>

            {citas.length === 0 ? (
              <div className="empty">No tienes citas registradas.</div>
            ) : (
              <div className="citas-grid">
                {citas.map((cita) => (
                  <div className="cita-card" key={cita.id}>
                    <div className="cita-head">
                      <strong>{cita.fecha} · {cita.hora}</strong>
                      <span className={'estado-' + cita.estado}>{cita.estado}</span>
                    </div>

                    <div className="info">
                      <div><strong>Vehículo:</strong> {cita.vehiculos?.marca} {cita.vehiculos?.modelo} · {cita.vehiculos?.placa}</div>
                      <div><strong>Dirección:</strong> {cita.distrito}, {cita.canton}, {cita.provincia}</div>
                    </div>

                    <div className="servicios-cita">
                      {cita.cita_servicios?.map((item) => (
                        <div key={item.id} className="servicio-mini">
                          {item.servicios?.nombre} · ₡{Number(item.precio || 0).toLocaleString('es-CR')}
                        </div>
                      ))}
                    </div>

                    {cita.estado === 'pendiente' && (
                      <button
                        className="editar-btn"
                        onClick={() => abrirEditarCita(cita)}
                      >
                        Editar cita
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {seccion === 'perfil' && (
          <div className="section perfil-section">
            <div className="perfil-head">
              <h2>Mi perfil</h2>
              {!editandoPerfil && (
                <button className="outline-btn" onClick={() => setEditandoPerfil(true)}>
                  Editar
                </button>
              )}
            </div>

            {!editandoPerfil ? (
              <div className="perfil-datos">
                <div className="perfil-campo">
                  <span className="campo-label">Nombre</span>
                  <span>{perfil?.nombre || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="campo-label">Teléfono</span>
                  <span>{perfil?.telefono || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="campo-label">Zona operativa</span>
                  <span>{perfil?.zona_operativa || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="campo-label">Provincia</span>
                  <span>{perfil?.provincia || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="campo-label">Cantón</span>
                  <span>{perfil?.canton || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="campo-label">Distrito</span>
                  <span>{perfil?.distrito || '—'}</span>
                </div>
                <div className="perfil-campo">
                  <span className="campo-label">Dirección exacta</span>
                  <span>{perfil?.direccion_detallada || '—'}</span>
                </div>
              </div>
            ) : (
              <div className="perfil-form">
                <label className="campo-label">Nombre</label>
                <input value={nombreEdit} onChange={(e) => setNombreEdit(e.target.value)} />

                <label className="campo-label">Teléfono</label>
                <input value={telefonoEdit} onChange={(e) => setTelefonoEdit(e.target.value)} />

                <label className="campo-label">Provincia</label>
                <select
                  value={provinciaEdit}
                  onChange={(e) => { setProvinciaEdit(e.target.value); setCantonEdit(''); setDistritoEdit('') }}
                >
                  <option value="">Seleccionar provincia</option>
                  {Object.keys(UBICACIONES).map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>

                <label className="campo-label">Cantón</label>
                <select
                  value={cantonEdit}
                  onChange={(e) => { setCantonEdit(e.target.value); setDistritoEdit('') }}
                  disabled={!provinciaEdit}
                >
                  <option value="">Seleccionar cantón</option>
                  {provinciaEdit && Object.keys(UBICACIONES[provinciaEdit] || {}).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <label className="campo-label">Distrito</label>
                <select
                  value={distritoEdit}
                  onChange={(e) => setDistritoEdit(e.target.value)}
                  disabled={!cantonEdit}
                >
                  <option value="">Seleccionar distrito</option>
                  {provinciaEdit && cantonEdit && (UBICACIONES[provinciaEdit]?.[cantonEdit] || []).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <label className="campo-label">Dirección exacta</label>
                <textarea value={direccionEdit} onChange={(e) => setDireccionEdit(e.target.value)} />

                <div className="modal-actions">
                  <button onClick={guardarPerfil}>Guardar cambios</button>
                  <button className="cancelar" onClick={() => setEditandoPerfil(false)}>Cancelar</button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {mostrarVehiculo && (
        <div className="modal-bg">
          <div className="modal">
            <h2>Agregar vehículo</h2>

            <input
              placeholder="Marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
            />

            <input
              placeholder="Modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
            />

            <input
              placeholder="Año"
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
            />

            <input
              placeholder="Placa"
              value={placa}
              onChange={(e) => setPlaca(e.target.value)}
            />

            <input
              placeholder="Color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
            />

            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            >
              {tiposVehiculo.map((tipoItem) => (
                <option key={tipoItem} value={tipoItem}>
                  {tipoItem}
                </option>
              ))}
            </select>

            <label className="check">
              <input
                type="checkbox"
                checked={ppf}
                onChange={(e) => setPpf(e.target.checked)}
              />
              Tiene PPF
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={ceramico}
                onChange={(e) => setCeramico(e.target.checked)}
              />
              Tiene tratamiento cerámico
            </label>

            <label className="check">
              <input
                type="checkbox"
                checked={wrap}
                onChange={(e) => setWrap(e.target.checked)}
              />
              Tiene Wrap
            </label>

            <textarea
              placeholder="Notas importantes"
              value={notasVehiculo}
              onChange={(e) => setNotasVehiculo(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={guardarVehiculo}>
                Guardar vehículo
              </button>

              <button
                className="cancelar"
                onClick={() => setMostrarVehiculo(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {mostrarCita && (
        <div className="modal-bg">
          <div className="modal modal-cita">
            <h2>Agendar cita a domicilio</h2>

            <select
              value={vehiculoId}
              onChange={(e) => {
                setVehiculoId(e.target.value)
                setServiciosSeleccionados([])
              }}
            >
              <option value="">Seleccionar vehículo</option>

              {vehiculos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.marca} {v.modelo} - {v.placa} / {v.tipo}
                </option>
              ))}
            </select>

            {vehiculoSeleccionado && (
              <div className="hint">
                Mostrando servicios para{' '}
                <strong>{vehiculoSeleccionado.tipo}</strong> y servicios
                generales.
              </div>
            )}

            <div className="servicios-lista">
              {serviciosFiltrados.length === 0 ? (
                <div className="empty">
                  No hay servicios disponibles para este tipo de vehículo.
                </div>
              ) : (
                serviciosFiltrados.map((servicio) => (
                  <label key={servicio.id} className="servicio-check">
                    <input
                      type="checkbox"
                      checked={serviciosSeleccionados.includes(servicio.id)}
                      onChange={() => toggleServicio(servicio.id)}
                    />

                    <div>
                      <strong>{servicio.nombre}</strong>
                      <small>
                        {servicio.tipo_vehiculo} · ₡
                        {Number(servicio.precio || 0).toLocaleString('es-CR')} ·{' '}
                        {servicio.duracion_minutos} min
                      </small>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="resumen">
              <div>
                <strong>Total estimado:</strong> ₡
                {resumenServicios.total.toLocaleString('es-CR')}
              </div>

              <div>
                <strong>Duración estimada:</strong>{' '}
                {resumenServicios.duracion} min
              </div>
            </div>

            <div className="date-field">
              <span className="date-value">
                {fecha ? fecha.split('-').reverse().join('/') : 'Seleccionar fecha'}
              </span>
              <div className="date-icon-area">
                <svg width="20" height="20" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="4" width="18" height="18" rx="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => { setFecha(e.target.value); setSlotsDisponibles([]); setHora('') }}
                />
              </div>
            </div>

            {fecha && (
              <button
                type="button"
                className="consultar-btn"
                onClick={consultarDisponibilidad}
                disabled={cargandoSlots}
              >
                {cargandoSlots ? 'Consultando disponibilidad...' : 'Ver horarios disponibles'}
              </button>
            )}

            {slotsDisponibles.length > 0 && (
              <select value={hora} onChange={(e) => setHora(e.target.value)}>
                <option value="">Seleccionar hora</option>
                {slotsDisponibles.filter((s) => s.disponible).map((s) => (
                  <option key={s.hora} value={s.hora}>{s.hora}</option>
                ))}
              </select>
            )}

            {slotsDisponibles.length > 0 && slotsDisponibles.filter((s) => s.disponible).length === 0 && (
              <div className="sin-slots">No hay horarios disponibles para esta fecha. Intentá otro día.</div>
            )}

            <div className="direccion-box">
              <h3>Dirección para la cita</h3>

              <select
                value={provinciaCita}
                onChange={(e) => {
                  setProvinciaCita(e.target.value)
                  setCantonCita('')
                  setDistritoCita('')
                }}
              >
                <option value="">Seleccionar provincia</option>
                {Object.keys(UBICACIONES).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={cantonCita}
                onChange={(e) => {
                  setCantonCita(e.target.value)
                  setDistritoCita('')
                }}
                disabled={!provinciaCita}
              >
                <option value="">Seleccionar cantón</option>
                {provinciaCita && Object.keys(UBICACIONES[provinciaCita] || {}).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={distritoCita}
                onChange={(e) => setDistritoCita(e.target.value)}
                disabled={!cantonCita}
              >
                <option value="">Seleccionar distrito</option>
                {provinciaCita && cantonCita && (UBICACIONES[provinciaCita]?.[cantonCita] || []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <textarea
                placeholder="Dirección exacta"
                value={direccionCita}
                onChange={(e) => setDireccionCita(e.target.value)}
              />
            </div>

            <textarea
              placeholder="Notas para la cita"
              value={notasCita}
              onChange={(e) => setNotasCita(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={guardarCita} disabled={submitting}>
                {submitting ? 'Guardando...' : 'Solicitar cita'}
              </button>

              <button
                className="cancelar"
                onClick={() => setMostrarCita(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {citaEditando && (
        <div className="modal-bg">
          <div className="modal modal-cita">
            <h2>Editar cita</h2>

            <div className="hint">
              Vehículo: <strong>{vehiculoEditando?.marca} {vehiculoEditando?.modelo} · {vehiculoEditando?.placa}</strong>
            </div>

            <div className="servicios-lista">
              {serviciosFiltradosEdit.length === 0 ? (
                <div className="empty">No hay servicios disponibles.</div>
              ) : (
                serviciosFiltradosEdit.map((servicio) => (
                  <label key={servicio.id} className="servicio-check">
                    <input
                      type="checkbox"
                      checked={serviciosEditCita.includes(servicio.id)}
                      onChange={() => toggleServicioEdit(servicio.id)}
                    />
                    <div>
                      <strong>{servicio.nombre}</strong>
                      <small>{servicio.tipo_vehiculo} · ₡{Number(servicio.precio || 0).toLocaleString('es-CR')} · {servicio.duracion_minutos} min</small>
                    </div>
                  </label>
                ))
              )}
            </div>

            <div className="resumen">
              <div><strong>Total estimado:</strong> ₡{resumenServiciosEdit.total.toLocaleString('es-CR')}</div>
              <div><strong>Duración estimada:</strong> {resumenServiciosEdit.duracion} min</div>
            </div>

            <input type="date" value={fechaEdit} onChange={(e) => setFechaEdit(e.target.value)} />
            <input type="time" value={horaEdit} onChange={(e) => setHoraEdit(e.target.value)} />

            <div className="direccion-box">
              <h3>Dirección para la cita</h3>

              <select
                value={provinciaEditCita}
                onChange={(e) => { setProvinciaEditCita(e.target.value); setCantonEditCita(''); setDistritoEditCita('') }}
              >
                <option value="">Seleccionar provincia</option>
                {Object.keys(UBICACIONES).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>

              <select
                value={cantonEditCita}
                onChange={(e) => { setCantonEditCita(e.target.value); setDistritoEditCita('') }}
                disabled={!provinciaEditCita}
              >
                <option value="">Seleccionar cantón</option>
                {provinciaEditCita && Object.keys(UBICACIONES[provinciaEditCita] || {}).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={distritoEditCita}
                onChange={(e) => setDistritoEditCita(e.target.value)}
                disabled={!cantonEditCita}
              >
                <option value="">Seleccionar distrito</option>
                {provinciaEditCita && cantonEditCita && (UBICACIONES[provinciaEditCita]?.[cantonEditCita] || []).map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <textarea
                placeholder="Dirección exacta"
                value={direccionEditCita}
                onChange={(e) => setDireccionEditCita(e.target.value)}
              />
            </div>

            <textarea
              placeholder="Notas para la cita"
              value={notasEditCita}
              onChange={(e) => setNotasEditCita(e.target.value)}
            />

            <div className="modal-actions">
              <button onClick={guardarModificacionCita}>Guardar cambios</button>
              <button className="cancelar" onClick={() => setCitaEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #080808;
          display: flex;
          color: white;
        }

        .loading {
          min-height: 100vh;
          background: #080808;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .sidebar {
          width: 280px;
          background: #0f0f0f;
          border-right: 1px solid #222;
          padding: 30px 20px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          height: 90px;
          object-fit: contain;
          margin-bottom: 8px;
        }

        .rol {
          color: #4FC3F7;
          font-size: 13px;
          letter-spacing: 3px;
          margin-bottom: 40px;
        }

        nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        nav button {
          background: transparent;
          border: none;
          color: white;
          text-align: left;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
        }

        nav button:hover,
        .active {
          background: #1a1a1a !important;
        }

        .logout {
          margin-top: auto;
          background: #1a1a1a;
          border: none;
          color: white;
          padding: 16px;
          border-radius: 12px;
          cursor: pointer;
        }

        .content {
          flex: 1;
          padding: 40px;
        }

        .top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 30px;
          gap: 20px;
        }

        .top-actions {
          display: flex;
          gap: 12px;
        }

        h1 {
          font-size: 42px;
          margin-bottom: 8px;
        }

        p {
          color: #777;
        }

        .nuevo-btn,
        .outline-btn {
          border: none;
          padding: 16px 22px;
          border-radius: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .nuevo-btn {
          background: #4FC3F7;
          color: black;
        }

        .outline-btn {
          background: #1a1a1a;
          color: white;
          border: 1px solid #333;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 40px;
        }

        .card,
        .section {
          background: #111;
          border: 1px solid #222;
          border-radius: 18px;
          padding: 24px;
        }

        .card h3 {
          color: #777;
          margin-bottom: 12px;
        }

        .card span {
          font-size: 28px;
          font-weight: 900;
        }

        .section {
          border-radius: 22px;
          padding: 30px;
          margin-bottom: 28px;
        }

        .vehiculos-grid,
        .citas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
        }

        .vehiculo-card,
        .cita-card {
          background: #181818;
          border: 1px solid #2a2a2a;
          border-radius: 18px;
          padding: 22px;
        }

        .vehiculo-top,
        .cita-head {
          display: flex;
          justify-content: space-between;
          margin-bottom: 18px;
          gap: 12px;
        }

        .tipo,
        .cita-head span {
          background: #4FC3F7;
          color: black;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .info {
          display: flex;
          flex-direction: column;
          gap: 8px;
          color: #ccc;
        }

        .badges {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .badge {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .ppf {
          background: #162734;
          color: #6ec8ff;
        }

        .ceramic {
          background: #2f220c;
          color: #ffc56e;
        }

        .wrap {
          background: #1a2a1a;
          color: #6fcf6f;
        }

        .boleta-detalles {
          margin-top: 16px;
          padding: 12px 14px;
          background: #101010;
          border: 1px solid #2a2a2a;
          border-radius: 12px;
        }

        .boleta-detalles-titulo {
          color: #4FC3F7;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .1em;
          margin-bottom: 10px;
        }

        .prot-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 6px;
        }

        .bd-badge {
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .bd-ceramic { background: #2f220c; color: #ffc56e; }
        .bd-ppf { background: #162734; color: #6ec8ff; }
        .bd-wrap { background: #1a2a1a; color: #6fcf6f; }
        .bd-ninguno { background: #222; color: #666; }

        .bd-info {
          color: #aaa;
          font-size: 13px;
          margin-top: 5px;
        }

        .bd-notas {
          margin-top: 8px;
          padding: 8px;
          background: #1a1a1a;
          border-radius: 8px;
          font-style: italic;
          color: #888;
        }

        .notas,
        .servicios-cita {
          margin-top: 20px;
        }

        .servicio-mini {
          background: #101010;
          border: 1px solid #2a2a2a;
          border-radius: 10px;
          padding: 10px;
          color: #aaa;
          margin-bottom: 8px;
        }

        .empty {
          color: #777;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, .8);
          display: flex;
          align-items: flex-start;
          justify-content: center;
          z-index: 999;
          padding: 20px;
          overflow-y: auto;
        }

        .modal {
          width: 100%;
          max-width: 560px;
          background: #111;
          border: 1px solid #222;
          border-radius: 20px;
          padding: 30px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin: auto;
        }

        .modal-cita {
          max-width: 720px;
        }

        input,
        select,
        textarea {
          background: #1a1a1a;
          border: 1px solid #333;
          color: white;
          padding: 16px;
          border-radius: 12px;
        }

        textarea {
          min-height: 100px;
        }

        .check {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .hint,
        .resumen,
        .direccion-box {
          background: #161616;
          border: 1px solid #2a2a2a;
          border-radius: 14px;
          padding: 16px;
          color: #ccc;
        }

        .direccion-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .direccion-box h3 {
          margin-bottom: 4px;
        }

        .servicios-lista {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 12px;
        }

        .servicio-check {
          background: #181818;
          border: 1px solid #333;
          border-radius: 14px;
          padding: 14px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          cursor: pointer;
        }

        .servicio-check small {
          display: block;
          color: #777;
          margin-top: 5px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
        }

        .modal-actions button {
          flex: 1;
          border: none;
          padding: 16px;
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

        .consultar-btn {
          background: #1a1a1a;
          border: 1px solid #4FC3F7;
          color: #4FC3F7;
          padding: 14px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
        }

        .consultar-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .consultar-btn:hover:not(:disabled) {
          background: #4FC3F7;
          color: black;
        }

        .date-field {
          background: #1a1a1a;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 14px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: white;
        }

        .date-value {
          color: #ccc;
          font-size: 15px;
        }

        .date-icon-area {
          position: relative;
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
        }

        .date-icon-area input[type="date"] {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
          padding: 0;
          border: none;
          background: transparent;
        }

        .sin-slots {
          background: #1a1010;
          border: 1px solid #5a2a2a;
          color: #ff8888;
          padding: 14px;
          border-radius: 12px;
          font-size: 14px;
        }

        .editar-btn {
          margin-top: 16px;
          width: 100%;
          background: #1a1a1a;
          border: 1px solid #4FC3F7;
          color: #4FC3F7;
          padding: 12px;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .editar-btn:hover {
          background: #4FC3F7;
          color: black;
        }

        .estado-pendiente { background: #1a3a1a; color: #6fcf6f; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 900; }
        .estado-confirmada { background: #1a2a3a; color: #6fb3ff; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 900; }
        .estado-completada { background: #2a2a2a; color: #aaa; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 900; }
        .estado-cancelada { background: #3a1a1a; color: #ff6f6f; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 900; }

        .perfil-section h2 { margin-bottom: 20px; }

        .perfil-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .perfil-head h2 { margin-bottom: 0; }

        .perfil-datos {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .perfil-campo {
          display: flex;
          flex-direction: column;
          gap: 4px;
          padding: 16px;
          background: #181818;
          border: 1px solid #2a2a2a;
          border-radius: 14px;
        }

        .campo-label {
          color: #777;
          font-size: 12px;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .perfil-form {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        @media (max-width: 900px) {
          .page {
            flex-direction: column;
          }

          .sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #222;
            box-sizing: border-box;
          }

          .content {
            padding: 20px;
          }

          .top,
          .top-actions {
            flex-direction: column;
            align-items: flex-start;
          }

          .top-actions,
          .nuevo-btn,
          .outline-btn {
            width: 100%;
          }

          .cards {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  )
}