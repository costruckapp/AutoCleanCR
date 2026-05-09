const tiposAuto = {
  Sedan: {
    icon: '🚗',
    express: '₡9.000',
    premium: '₡13.000',
    ceramic: '₡18.000',
  },
  SUV: {
    icon: '🚙',
    express: '₡10.000',
    premium: '₡15.000',
    ceramic: '₡20.000',
  },
  'Pick Up': {
    icon: '🛻',
    express: '₡12.000',
    premium: '₡16.000',
    ceramic: '₡21.000',
  },
  XL: {
    icon: '🚐',
    express: '₡12.000',
    premium: '₡19.000',
    ceramic: '₡25.000',
  },
}

const heroServicios = [
  {
    titulo: 'Lavado Premium',
    subtitulo: 'Lavado espumado profesional con acabados premium.',
  },
  {
    titulo: 'Pulido de Carrocería',
    subtitulo: 'Recuperación de brillo y eliminación de imperfecciones.',
  },
  {
    titulo: 'Pulido de Parabrisas',
    subtitulo: 'Mayor visibilidad y repelencia para lluvia.',
  },
  {
    titulo: 'Lavado de Motor',
    subtitulo: 'Limpieza segura y detallada del compartimiento del motor.',
  },
  {
    titulo: 'Recuperación de Focos',
    subtitulo: 'Restauración de claridad y apariencia original.',
  },
]

export default async function Home({ searchParams }) {
  const params = await searchParams
  const tipoUrl = params?.tipo
  const tipo = tiposAuto[tipoUrl] ? tipoUrl : 'Sedan'
  const actual = tiposAuto[tipo]
  const cyan = '#4FC3F7'

  const planes = [
    {
      nombre: 'Express',
      tiempo: '20 - 30 min',
      precio: actual.express,
      detalle: [
        'Lavado espumado',
        'Aspirado interno',
        'Limpieza de vidrios',
        'Dressing interior',
        'Hidratante de llantas',
        'Cera básica',
        'Secado manual',
      ],
    },
    {
      nombre: 'Premium',
      tiempo: '45 - 60 min',
      precio: actual.premium,
      detalle: [
        'Descontaminación previa',
        'Lavado espumado',
        'Aspirado interno',
        'Limpieza de vidrios',
        'Spray sealant',
        'Dressing premium',
        'Secado manual',
      ],
    },
    {
      nombre: 'Ceramic Wash',
      tiempo: '60 - 90 min',
      precio: actual.ceramic,
      detalle: [
        'Lavado especializado para vehículos ceramizados',
        'Shampoo PH neutro para coatings',
        'Procedimientos seguros para cerámicos',
        'Protección y mantenimiento de durabilidad',
        'Aspirado interno',
        'Limpieza premium de vidrios',
        'Secado seguro con microfibra premium',
      ],
    },
  ]

  return (
    <main>
      <style>{`
        body {
          margin: 0;
          background: #080808;
        }

        main {
          background: #080808;
          color: white;
          font-family: system-ui, sans-serif;
          overflow-x: hidden;
        }

        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: rgba(8,8,8,.97);
          border-bottom: 1px solid #222;
        }

        .nav-inner {
          padding: 14px 60px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand img {
          height: 52px;
          object-fit: contain;
        }

        .desktop-menu {
          display: flex;
          gap: 22px;
          align-items: center;
        }

        .desktop-menu a,
        .mobile-panel a {
          color: #aaa;
          text-decoration: none;
          text-transform: uppercase;
          font-size: 13px;
        }

        .portal-clientes {
          background: ${cyan};
          color: #000 !important;
          padding: 10px 18px;
          border-radius: 4px;
          font-weight: 800;
        }

        .portal-colaboradores {
          background: #1a1a1a;
          color: #ddd !important;
          border: 1px solid #444;
          padding: 10px 16px;
          border-radius: 4px;
          font-weight: 700;
        }

        details {
          display: none;
        }

        summary {
          list-style: none;
          background: #1a1a1a;
          border: 1px solid #444;
          border-radius: 8px;
          padding: 12px 16px;
          color: #fff;
          font-size: 22px;
          cursor: pointer;
        }

        summary::-webkit-details-marker {
          display: none;
        }

        .mobile-panel {
          position: fixed;
          top: 62px;
          left: 0;
          right: 0;
          background: #050505;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          z-index: 10000;
          border-bottom: 1px solid #222;
        }

        .mobile-panel a {
          color: white;
          font-size: 28px;
          font-weight: 900;
        }

        .hero {
          min-height: 100vh;
          position: relative;
          display: flex;
          align-items: center;
          overflow: hidden;
        }

        .hero-slide {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          opacity: 0;
          animation: heroFade 25s infinite;
          filter: brightness(.25);
        }

        .slide1 { background-image: url('/lavado-espumado.jpg'); animation-delay: 0s; }
        .slide2 { background-image: url('/pulido-carroceria.jpg'); animation-delay: 5s; }
        .slide3 { background-image: url('/pulido-parabrisas.webp'); animation-delay: 10s; }
        .slide4 { background-image: url('/lavado-motor.jpg'); animation-delay: 15s; }
        .slide5 { background-image: url('/pulido-focos.webp'); animation-delay: 20s; }

        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg,rgba(8,8,8,.75),rgba(8,8,8,.35),#080808);
          z-index: 1;
          pointer-events: none;
        }

        @keyframes heroFade {
          0% { opacity: 0; }
          8% { opacity: 1; }
          24% { opacity: 1; }
          32% { opacity: 0; }
          100% { opacity: 0; }
        }

        .hero-logo {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          height: 150px;
          object-fit: contain;
          z-index: 2;
        }

        .hero-content {
          position: relative;
          z-index: 3;
          padding: 0 60px;
          max-width: 820px;
          margin-top: 100px;
        }

        h1 {
          font-size: 96px;
          line-height: .9;
          font-weight: 950;
          margin: 0 0 20px;
          letter-spacing: -2px;
        }

        .cyan {
          color: ${cyan};
        }

        .hero p {
          color: #aaa;
          font-size: 16px;
          line-height: 1.8;
          max-width: 420px;
          margin-bottom: 32px;
        }

        .hero-info {
          position: absolute;
          right: 40px;
          bottom: 48px;
          z-index: 4;
          width: 340px;
          min-height: 90px;
          text-align: right;
        }

        .hero-service {
          position: absolute;
          inset: 0;
          opacity: 0;
          animation: heroText 25s infinite;
        }

        .hero-service:nth-child(1) { animation-delay: 0s; }
        .hero-service:nth-child(2) { animation-delay: 5s; }
        .hero-service:nth-child(3) { animation-delay: 10s; }
        .hero-service:nth-child(4) { animation-delay: 15s; }
        .hero-service:nth-child(5) { animation-delay: 20s; }

        @keyframes heroText {
          0% { opacity: 0; transform: translateY(16px); }
          8% { opacity: 1; transform: translateY(0); }
          24% { opacity: 1; transform: translateY(0); }
          32% { opacity: 0; transform: translateY(16px); }
          100% { opacity: 0; transform: translateY(16px); }
        }

        .hero-service-title {
          color: ${cyan};
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .16em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .hero-service-text {
          color: #777;
          font-size: 13px;
          line-height: 1.6;
        }

        .btn {
          display: inline-block;
          background: ${cyan};
          color: #000;
          padding: 14px 28px;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 800;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: .08em;
          text-align: center;
        }

        .btn-outline {
          background: transparent;
          color: #ddd;
          border: 1px solid #444;
        }

        .section {
          padding: 80px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .eyebrow {
          font-size: 11px;
          letter-spacing: .2em;
          text-transform: uppercase;
          color: ${cyan};
          margin-bottom: 12px;
        }

        h2 {
          font-size: 80px;
          line-height: .9;
          font-weight: 950;
          margin: 0 0 40px;
        }

        .selector {
          background: #0d0d0d;
          border: 1px solid #222;
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 36px;
        }

        .selector-title {
          color: #777;
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: .12em;
          margin-bottom: 14px;
        }

        .tipo-grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 10px;
        }

        .tipo-card {
          background: #111;
          color: #fff;
          border: 2px solid #222;
          border-radius: 12px;
          padding: 16px 12px;
          text-align: center;
          font-weight: 900;
          text-decoration: none;
          display: block;
        }

        .tipo-card.active {
          background: ${cyan};
          color: #000;
          border-color: ${cyan};
        }

        .tipo-icon {
          font-size: 24px;
          margin-bottom: 6px;
        }

        .planes {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
        }

        .plan {
          background: #111;
          border: 1px solid #222;
          border-radius: 14px;
          padding: 22px;
        }

        .plan.destacado {
          border-color: ${cyan};
        }

        .plan-title {
          color: ${cyan};
          font-size: 22px;
          font-weight: 950;
          text-transform: uppercase;
        }

        .plan-time {
          color: #777;
          font-size: 13px;
          margin-top: 4px;
        }

        .price {
          font-size: 34px;
          font-weight: 950;
          margin: 18px 0;
        }

        .check {
          color: #aaa;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .footer {
          border-top: 1px solid #1a1a1a;
          padding: 40px 20px;
          text-align: center;
          color: #555;
        }

        @media (max-width: 1024px) {
          .nav-inner {
            padding: 12px 16px;
          }

          .desktop-menu {
            display: none;
          }

          details {
            display: block;
          }

          .hero-logo {
            height: 90px;
            top: 9%;
          }

          .hero-content {
            padding: 0 20px;
            margin-top: 60px;
          }

          h1 {
            font-size: 52px;
          }

          .section {
            padding: 48px 20px;
          }

          h2 {
            font-size: 48px;
          }

          .tipo-grid {
            grid-template-columns: 1fr 1fr;
          }

          .planes {
            grid-template-columns: 1fr;
          }

          .hero-buttons {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .hero-info {
            left: 20px;
            right: 20px;
            bottom: 24px;
            width: auto;
            text-align: center;
          }
        }
      `}</style>

      <nav className="nav">
        <div className="nav-inner">
          <div className="brand">
            <img src="/logo-png.png" alt="AutoClean CR" />
          </div>

          <details>
            <summary>☰</summary>

            <div className="mobile-panel">
              <a href="/?m=1#servicios">Servicios</a>
              <a href="/?m=2#nosotros">Nosotros</a>
              <a href="/?m=3#contacto">Contacto</a>

              <a className="portal-clientes" href="/login?rol=cliente">
                Portal Clientes
              </a>

              <a className="portal-colaboradores" href="/login?rol=colaborador">
                Portal Colaboradores
              </a>
            </div>
          </details>

          <div className="desktop-menu">
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
            <a href="#contacto">Contacto</a>

            <a className="portal-colaboradores" href="/login?rol=colaborador">
              Colaboradores
            </a>

            <a className="portal-clientes" href="/login?rol=cliente">
              Clientes
            </a>
          </div>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-slide slide1"></div>
        <div className="hero-slide slide2"></div>
        <div className="hero-slide slide3"></div>
        <div className="hero-slide slide4"></div>
        <div className="hero-slide slide5"></div>

        <div className="hero-overlay"></div>

        <img className="hero-logo" src="/logo-png.png" alt="AutoClean CR" />

        <div className="hero-content">
          <h1>
            TU AUTO<br />
            <span className="cyan">MERECE</span><br />
            LO MEJOR
          </h1>

          <p>
            Nueva experiencia Express Premium. Lavados rápidos, eficientes y de alta calidad.
          </p>

          <div className="hero-buttons">
            <a href="#servicios" className="btn">
              Ver Servicios
            </a>

            {' '}

            <a
              href="https://wa.me/50640821459"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
            >
              WhatsApp
            </a>
          </div>
        </div>

        <div className="hero-info">
          {heroServicios.map((servicio) => (
            <div className="hero-service" key={servicio.titulo}>
              <div className="hero-service-title">{servicio.titulo}</div>
              <div className="hero-service-text">{servicio.subtitulo}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="servicios" className="section">
        <div className="eyebrow">Express Wash</div>

        <h2>
          NUEVA<br />
          <span className="cyan">EXPERIENCIA</span>
        </h2>

        <div className="selector">
          <div className="selector-title">
            Seleccioná tu tipo de vehículo
          </div>

          <div className="tipo-grid">
            {Object.keys(tiposAuto).map((nombre) => (
              <a
                key={nombre}
                href={`/?tipo=${encodeURIComponent(nombre)}#servicios`}
                className={`tipo-card ${tipo === nombre ? 'active' : ''}`}
              >
                <div className="tipo-icon">{tiposAuto[nombre].icon}</div>
                <div>{nombre}</div>
              </a>
            ))}
          </div>

          <div style={{ marginTop: '14px', color: '#777', fontSize: '13px' }}>
            Tipo actual:{' '}
            <strong style={{ color: cyan }}>
              {tipo}
            </strong>
          </div>
        </div>

        <div style={{ marginBottom: '48px' }}>
          <h3 style={{ fontSize: '26px', fontWeight: 900 }}>
            AUTOLAVADO{' '}
            <span style={{ color: cyan, fontSize: '14px' }}>
              — {tipo}
            </span>
          </h3>

          <div className="planes">
            {planes.map((plan, index) => (
              <div
                key={plan.nombre}
                className={`plan ${index === 1 ? 'destacado' : ''}`}
              >
                <div className="plan-title">{plan.nombre}</div>
                <div className="plan-time">{plan.tiempo}</div>
                <div className="price">{plan.precio}</div>

                {plan.detalle.map((item) => (
                  <div key={item} className="check">
                    <span style={{ color: cyan }}>✓</span> {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="nosotros"
        className="section"
        style={{ background: '#0d0d0d', maxWidth: 'none' }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div className="eyebrow">¿Por qué elegirnos?</div>

          <h2>
            RÁPIDO · <span className="cyan">SEGURO</span> · PREMIUM
          </h2>

          <p
            style={{
              color: '#777',
              maxWidth: '720px',
              lineHeight: 1.8,
            }}
          >
            Más autos atendidos, menos espera, productos de calidad y resultados que se notan desde el primer lavado.
          </p>
        </div>
      </section>

      <footer id="contacto" className="footer">
        <img
          src="/logo-png.png"
          alt="AutoClean CR"
          style={{
            height: '52px',
            objectFit: 'contain',
            marginBottom: '14px',
          }}
        />

        <div>💬 4082-1459</div>
        <div>✉ AutoClean506@gmail.com</div>

        <div style={{ marginTop: '16px' }}>
          © 2026 AutoClean CR · Todos los derechos reservados
        </div>
      </footer>
    </main>
  )
}