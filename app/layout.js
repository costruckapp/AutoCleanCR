import './globals.css'

export const metadata = {
  title: 'AutoClean CR - Car Studio Detailing',
  description: 'Lavacar Express en Curridabat, San José',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}