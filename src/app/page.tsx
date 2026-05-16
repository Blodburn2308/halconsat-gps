"use client"

import { useEffect } from "react"
import Link from "next/link"
import ChatWidget from "@/components/landing/ChatWidget"

export default function LandingPage() {

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add("visible")
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" }
    )
    document.querySelectorAll(".hs-reveal").forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const navbar = document.getElementById("hs-navbar")
    const onScroll = () => navbar?.classList.toggle("scrolled", window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const counters = document.querySelectorAll<HTMLElement>(".hs-count")
    counters.forEach(el => {
      const target = parseInt(el.dataset.target || "0")
      let current = 0
      const step = Math.ceil(target / 60)
      const timer = setInterval(() => {
        current = Math.min(current + step, target)
        el.textContent = current + (el.dataset.suffix || "")
        if (current >= target) clearInterval(timer)
      }, 24)
    })
  }, [])

  return (
    <div className="landing-root">

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
      `}</style>

      {/* NAVBAR */}
      <header className="hs-navbar" id="hs-navbar">
        <div className="hs-logo">HALCON<span>SAT</span></div>
        <nav>
          <ul className="hs-nav-links">
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#servicios">Rastreo</a></li>
            <li><a href="#plataforma">Plataforma</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li>
              <Link href="/login" className="hs-nav-cta">
                Ingresar
              </Link>
            </li>
          </ul>
        </nav>
      </header>

      {/* HERO */}
      <section id="inicio" className="hs-hero">
        <div className="hs-hero-inner">
          <div className="hs-hero-content">
            <div className="hs-hero-badge">🛰️ Tecnología Satelital de Precisión</div>
            <h1 className="hs-hero-title">
              Protege tu vehículo con<br />
              <span className="hl">Tecnología Avanzada</span>
            </h1>
            <p className="hs-hero-desc">
              Rastreo en tiempo real, alertas inteligentes y control total desde cualquier lugar
              a través de nuestra plataforma profesional.
            </p>
            <div className="hs-hero-actions">
              <Link href="/login" className="hs-btn-primary" style={{display:'inline-block'}}>
                Ingresar a la plataforma
              </Link>
              <a href="https://wa.me/593999999999" className="hs-btn-secondary">
                💬 Chat Directo
              </a>
            </div>
            <div className="hs-hero-stats">
              <div className="hs-stat">
                <span className="hs-stat-num hs-count" data-target="500" data-suffix="+">0</span>
                <span className="hs-stat-label">Vehículos activos</span>
              </div>
              <div className="hs-stat">
                <span className="hs-stat-num">24/7</span>
                <span className="hs-stat-label">Monitoreo</span>
              </div>
              <div className="hs-stat">
                <span className="hs-stat-num hs-count" data-target="99" data-suffix="%">0</span>
                <span className="hs-stat-label">Uptime</span>
              </div>
            </div>
          </div>

          <div className="hs-hero-visual">
            <div className="hs-hero-img-wrap">
              <img src="https://blog.carsync.com/hubfs/GPS%20para%20carros.png" alt="Plataforma HalconSat" />
            </div>
            <div className="hs-float-card">
              <div className="fc-icon">📍</div>
              <div>
                <div className="hs-fc-text">GPS Activo</div>
                <div className="hs-fc-sub">Actualizando en tiempo real…</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICIOS */}
      <section id="servicios" className="hs-services">
        <div className="hs-services-head hs-reveal">
          <div className="hs-section-label">Características</div>
          <h2 className="hs-section-title">Nuestras Funciones de Seguridad</h2>
          <p className="hs-section-desc" style={{margin:"0 auto"}}>
            Todo lo que necesitas para mantener tu vehículo seguro y bajo control, desde un solo lugar.
          </p>
        </div>
        <div className="hs-cards-grid">
          {[
            { icon: "⚠️", title: "Botón de Pánico", desc: "Alerta inmediata a nuestra central en caso de emergencia durante tu recorrido." },
            { icon: "⏻",  title: "Apagado de Motor", desc: "Inmoviliza tu vehículo de forma remota en segundos ante cualquier sospecha de robo." },
            { icon: "📡", title: "Sensor de Movimiento", desc: "Recibe notificaciones al instante si tu vehículo es encendido o movido sin autorización." },
            { icon: "🗺️", title: "Geocercas", desc: "Delimita zonas seguras y recibe alertas automáticas si el vehículo sale de la ruta establecida." },
            { icon: "📱", title: "App Móvil", desc: "Control total en la palma de tu mano. Interfaz intuitiva y fácil de utilizar." },
            { icon: "🛡️", title: "Monitoreo 24/7", desc: "Respaldo continuo con historiales de recorridos y reportes detallados de la unidad." },
          ].map((s, i) => (
            <div key={i} className="hs-card hs-reveal">
              <div className="hs-card-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="plataforma" style={{padding:"100px 5%", background:"var(--bg)"}}>
        <div className="hs-platform">
          <div className="hs-platform-img hs-reveal">
            <img
              src="https://clickpetroleoegas.com.br/wp-content/uploads/2023/09/SUV-moderno-e-sofisticado-da-Hyundai-sofre-reducao-de-R-50-mil-.jpg"
              alt="Vehículo protegido por HalconSat"
            />
          </div>
          <div>
            <div className="hs-section-label hs-reveal">¿Cómo funciona?</div>
            <h2 className="hs-section-title hs-reveal">
              Protección en <span style={{color:"var(--accent)"}}>3 simples pasos</span>
            </h2>
            <p className="hs-section-desc hs-reveal" style={{marginBottom:"2rem"}}>
              Instalamos, configuramos y monitoreamos. Tú solo conduce sin preocupaciones.
            </p>
            <div className="hs-steps">
              {[
                { n:"01", t:"Instalación Profesional", d:"Nuestros técnicos certificados instalan el dispositivo GPS de forma discreta en tu vehículo." },
                { n:"02", t:"Configuración Personalizada", d:"Creamos geocercas, alertas y permisos de acuerdo a tus necesidades específicas." },
                { n:"03", t:"Monitoreo Continuo", d:"Accede en tiempo real desde la app o plataforma web. Nuestro equipo te respalda 24/7." },
              ].map((s, i) => (
                <div key={i} className="hs-step hs-reveal">
                  <div className="hs-step-num">{s.n}</div>
                  <div>
                    <h4>{s.t}</h4>
                    <p>{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contacto" className="hs-cta-band">
        <div className="hs-cta-inner hs-reveal">
          <div className="hs-section-label">Empieza hoy</div>
          <h2>¿Listo para proteger tu vehículo?</h2>
          <p>Únete a cientos de conductores que ya confían en HalconSat. Cotización sin compromiso.</p>
          <Link href="/login" className="hs-btn-primary" style={{display:"inline-block"}}>
            Ingresar a la plataforma
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="hs-footer">
        <div className="hs-footer-grid">
          <div className="hs-footer-brand">
            <div className="hs-logo">HALCON<span>SAT</span></div>
            <p>Líderes en tecnología de rastreo y seguridad vehicular. Tu tranquilidad es nuestro objetivo.</p>
          </div>
          <div className="hs-footer-col">
            <h4>Empresa</h4>
            <ul>
              <li><a href="#">Sobre Nosotros</a></li>
              <li><a href="#">Servicios</a></li>
              <li><a href="#">Términos y Condiciones</a></li>
            </ul>
          </div>
          <div className="hs-footer-col">
            <h4>Contacto</h4>
            <div className="hs-contact-item">📍 Ibarra, Ecuador</div>
            <div className="hs-contact-item">📞 +593 999 999 999</div>
            <div className="hs-contact-item">✉️ info@halconsat.com</div>
          </div>
          <div className="hs-footer-col">
            <h4>Síguenos</h4>
            <div className="hs-social-row">
              <a href="#" className="hs-social-btn">f</a>
              <a href="#" className="hs-social-btn">in</a>
              <a href="#" className="hs-social-btn">ig</a>
            </div>
          </div>
        </div>
        <div className="hs-footer-bottom">
          <p>© 2026 HalconSat Seguridad Vehicular. Todos los derechos reservados.</p>
        </div>
      </footer>

      <ChatWidget />
    </div>
  )
}
