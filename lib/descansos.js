// Break schedule configuration and calculation logic

export const BREAKS_CONFIG = [
  {
    id: 'cafe_manana',
    nombre: 'Café mañana',
    duracion: 15,
    ventanaInicio: 7 * 60,       // 7:00
    ventanaFin: 9 * 60,          // 9:00
    preferido: 8 * 60,           // 8:00 default
    diasSemana: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'almuerzo',
    nombre: 'Almuerzo',
    duracion: 30,
    ventanaInicio: 11 * 60 + 30, // 11:30
    ventanaFin: 14 * 60,         // 14:00
    preferido: 12 * 60,          // 12:00 default
    diasSemana: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    id: 'cafe_tarde',
    nombre: 'Café tarde',
    duracion: 15,
    ventanaInicio: 15 * 60,      // 15:00
    ventanaFin: 17 * 60,         // 17:00
    preferido: 15 * 60,          // 15:00 default
    diasSemana: [1, 2, 3, 4, 5, 6], // Lun-Sab, no Domingo
  },
]

function encontrarSlot(ocupados, ventanaInicio, ventanaFin, duracion, preferido) {
  // Search forward from the preferred time
  for (let min = preferido; min <= ventanaFin - duracion; min += 5) {
    if (!ocupados.some(o => min < o.finMin && min + duracion > o.inicioMin)) return min
  }
  // If not found, try from window start up to preferred
  for (let min = ventanaInicio; min < preferido; min += 5) {
    if (!ocupados.some(o => min < o.finMin && min + duracion > o.inicioMin)) return min
  }
  return null
}

export function minToHora(min) {
  if (min === null || min === undefined) return null
  return `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
}

/**
 * Calculate the optimal break schedule for a given day.
 *
 * @param {Array<{inicioMin: number, finMin: number}>} citasOcupadas - service times only, no travel buffer
 * @param {string} fecha - 'YYYY-MM-DD'
 * @returns {Array<{id, nombre, duracion, inicio, fin}>}
 */
export function calcularDescansos(citasOcupadas, fecha) {
  const [y, mo, d] = fecha.split('-').map(Number)
  const diaSemana = new Date(y, mo - 1, d).getDay() // 0=Sunday, 6=Saturday

  return BREAKS_CONFIG
    .filter(b => b.diasSemana.includes(diaSemana))
    .map(b => {
      const inicio = encontrarSlot(citasOcupadas, b.ventanaInicio, b.ventanaFin, b.duracion, b.preferido)
      return {
        id: b.id,
        nombre: b.nombre,
        duracion: b.duracion,
        inicio,
        fin: inicio !== null ? inicio + b.duracion : null,
      }
    })
}
