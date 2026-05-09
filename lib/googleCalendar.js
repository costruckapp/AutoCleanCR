import { google } from 'googleapis'

function getAuth() {
  return new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
}

export async function getEventosDelDia(fecha) {
  const auth = getAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const inicio = new Date(`${fecha}T00:00:00-06:00`)
  const fin = new Date(`${fecha}T23:59:59-06:00`)

  const { data } = await calendar.events.list({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    timeMin: inicio.toISOString(),
    timeMax: fin.toISOString(),
    singleEvents: true,
    orderBy: 'startTime',
  })

  return data.items || []
}

export async function crearEvento({ titulo, fecha, hora, duracionMinutos, descripcion, ubicacion }) {
  const auth = getAuth()
  const calendar = google.calendar({ version: 'v3', auth })

  const inicio = new Date(`${fecha}T${hora}:00-06:00`)
  const fin = new Date(inicio.getTime() + duracionMinutos * 60000)

  const { data } = await calendar.events.insert({
    calendarId: process.env.GOOGLE_CALENDAR_ID,
    requestBody: {
      summary: titulo,
      description: descripcion,
      location: ubicacion,
      start: { dateTime: inicio.toISOString(), timeZone: 'America/Costa_Rica' },
      end: { dateTime: fin.toISOString(), timeZone: 'America/Costa_Rica' },
    },
  })

  return data
}
