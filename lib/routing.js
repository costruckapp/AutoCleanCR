export async function tiempoDeViaje(origen, destino) {
  try {
    // ORS usa [longitud, latitud]
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${process.env.ORS_API_KEY}&start=${origen.lng},${origen.lat}&end=${destino.lng},${destino.lat}`
    const res = await fetch(url)

    if (!res.ok) {
      console.error('ORS error:', res.status)
      return 45
    }

    const data = await res.json()

    if (!data.features || data.features.length === 0) return 45

    const segundos = data.features[0].properties.segments[0].duration
    return Math.ceil(segundos / 60)
  } catch (e) {
    console.error('Routing error:', e.message)
    return 45
  }
}
