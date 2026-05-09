const USER_AGENT = 'AutoCleanCR/1.0 autoclean506@gmail.com'

export async function geocodificar(direccion, canton, provincia) {
  const intentos = [
    `${direccion}, ${canton}, ${provincia}, Costa Rica`,
    `${canton}, ${provincia}, Costa Rica`,
    `${provincia}, Costa Rica`,
  ]

  for (const query of intentos) {
    if (!query.trim()) continue

    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1&countrycodes=cr`
      const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } })
      const data = await res.json()

      if (data && data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) }
      }
    } catch (e) {
      console.error('Geocoding error:', e.message)
    }
  }

  return null
}
