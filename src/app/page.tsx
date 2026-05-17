"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import ChatWidget from "@/components/landing/ChatWidget"

function BrandHead() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </>
  )
}

function Logo() {
  return (
    <div className="l-logo">
      <span className="l-logo-mark">
        <i className="fa-solid fa-satellite-dish" />
      </span>
      HALCON<span className="accent">SAT</span>
    </div>
  )
}

function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return (
    <header className={`l-nav ${scrolled ? "is-scrolled" : ""}`}>
      <Logo />
      <nav>
        <a href="#caracteristicas">Características</a>
        <a href="#plataforma">Plataforma</a>
        <a href="#pasos">Cómo funciona</a>
        <a href="#contacto">Contacto</a>
      </nav>
      <div style={{ display: "flex", gap: ".6rem" }}>
        <Link href="/login" className="btn btn-ghost" style={{ padding: ".5rem 1rem", fontSize: ".82rem" }}>
          <i className="fa-solid fa-arrow-right-to-bracket" /> Ingresar
        </Link>
        <a href="https://wa.me/593999999999" className="btn btn-primary" style={{ padding: ".5rem 1.1rem", fontSize: ".82rem" }}>
          Cotizar
        </a>
      </div>
    </header>
  )
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: "1.6rem", fontWeight: 600, color: "var(--accent)" }}>
        {n}
      </div>
      <div style={{ fontSize: ".74rem", color: "var(--muted-on)", textTransform: "uppercase", letterSpacing: ".08em", marginTop: 2 }}>
        {l}
      </div>
    </div>
  )
}

function FloatingCard({
  icon, title, sub, tone, style,
}: {
  icon: string
  title: string
  sub: string
  tone: "success" | "accent"
  style: React.CSSProperties
}) {
  return (
    <div className={`l-float-card${tone === "accent" ? " delay" : ""}`} style={{ position: "absolute", ...style }}>
      <div className={`l-float-icon tone-${tone}`}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: ".85rem", fontWeight: 700 }}>{title}</div>
        <div style={{ fontSize: ".72rem", color: "var(--muted-on)" }}>{sub}</div>
      </div>
    </div>
  )
}

function PlatformPreviewMini() {
  return (
    <div className="surface-card l-preview-mini">
      <div className="l-pm-bar">
        <div className="l-pm-dots"><span /><span /><span /></div>
        <div className="mono" style={{ fontSize: ".72rem", color: "var(--muted-on)" }}>halconsat.app — Panel</div>
        <span className="pill pill-success" style={{ fontSize: ".65rem", padding: ".15rem .5rem" }}>
          <span className="pulse" />LIVE
        </span>
      </div>
      <div className="l-pm-body">
        <div className="l-pm-map">
          <div className="l-fake-map" />
          <div className="l-pm-pin" style={{ top: "38%", left: "46%" }}><div className="hs-pin" /></div>
          <div className="l-pm-pin" style={{ top: "60%", left: "32%" }}><div className="hs-pin danger" /></div>
          <div className="l-pm-pin" style={{ top: "25%", left: "64%" }}><div className="hs-pin success" /></div>
        </div>
        <div className="l-pm-side">
          <div className="l-pm-kpi">
            <span>VEHÍCULOS</span>
            <strong className="mono">8/8</strong>
          </div>
          <div className="l-pm-kpi">
            <span>ALERTAS</span>
            <strong className="mono" style={{ color: "var(--danger)" }}>2</strong>
          </div>
          <div className="l-pm-kpi">
            <span>KM HOY</span>
            <strong className="mono">412</strong>
          </div>
          <div className="l-pm-alert">
            <i className="fa-solid fa-triangle-exclamation" style={{ color: "var(--danger)" }} />
            <div>
              <div style={{ fontWeight: 600, fontSize: ".78rem" }}>Botón de pánico</div>
              <div style={{ fontSize: ".7rem", color: "var(--muted-on)" }}>PCN-4419 · hace 4s</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="l-hero">
      <div className="l-hero-bg-grid" aria-hidden="true" />
      <div className="l-hero-inner">
        <div>
          <span className="pill pill-accent" style={{ marginBottom: "1.4rem" }}>
            <span className="pulse" />
            <span className="mono">SAT · IBARRA — ECUADOR</span>
          </span>
          <h1 className="h-display" style={{ fontSize: "clamp(2.5rem, 5vw, 4.6rem)" }}>
            Tu vehículo,<br />
            <span style={{ color: "var(--accent)" }}>siempre en órbita.</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--text-soft)", margin: "1.4rem 0 2rem", maxWidth: 520 }}>
            Rastreo satelital en tiempo real, geocercas inteligentes y respuesta inmediata
            ante emergencias. Una sola plataforma — para ti y para tu flota.
          </p>
          <div style={{ display: "flex", gap: ".85rem", flexWrap: "wrap" }}>
            <Link href="/login" className="btn btn-primary">
              <i className="fa-solid fa-satellite" /> Ver plataforma en vivo
            </Link>
            <a href="https://wa.me/593999999999" className="btn btn-ghost">
              <i className="fa-brands fa-whatsapp" style={{ color: "#25d366" }} /> Hablar con un asesor
            </a>
          </div>
          <div className="l-hero-stats">
            <Stat n="500+" l="Vehículos activos" />
            <Stat n="99.7%" l="Uptime de red" />
            <Stat n="24/7" l="Central de monitoreo" />
            <Stat n="< 60s" l="Tiempo de respuesta" />
          </div>
        </div>

        <div className="l-hero-right">
          <PlatformPreviewMini />
          <FloatingCard
            icon="fa-tower-broadcast" title="Señal GPS estable" sub="3 satélites · ±2m" tone="success"
            style={{ top: "-20px", right: "-22px" }}
          />
          <FloatingCard
            icon="fa-triangle-exclamation" title="Geocerca activa" sub="Zona Almacén — OK" tone="accent"
            style={{ bottom: "-26px", left: "-22px" }}
          />
        </div>
      </div>
    </section>
  )
}

function Marquee() {
  const items = ["Transportes Andinos", "Distribuidora Norte", "Lácteos San Pedro", "Constructora Imbabura", "AgroNorte", "Tecno Logística"]
  return (
    <div className="l-marquee">
      <span className="eyebrow" style={{ marginRight: "2rem" }}>Confían en nosotros</span>
      <div className="l-marquee-track">
        {[...items, ...items].map((x, i) => (
          <span key={i} className="l-marquee-item">
            <i className="fa-solid fa-circle-check" style={{ color: "var(--accent)", fontSize: ".7rem" }} />
            {x}
          </span>
        ))}
      </div>
    </div>
  )
}

function Features() {
  const items = [
    { i: "fa-triangle-exclamation", t: "Botón de Pánico", d: "Alerta inmediata a nuestra central de monitoreo en caso de emergencia. Respuesta verificada en menos de 60 segundos." },
    { i: "fa-power-off",             t: "Apagado Remoto",   d: "Inmoviliza tu vehículo de forma segura desde la app — útil ante sospechas de robo o uso no autorizado." },
    { i: "fa-map-location-dot",      t: "Geocercas",        d: "Define zonas seguras o rutas. Recibe alertas automáticas cuando un vehículo entra o sale del perímetro." },
    { i: "fa-gauge-high",            t: "Control de velocidad", d: "Establece límites por vehículo o por zona. Detecta y registra excesos en tiempo real." },
    { i: "fa-clock-rotate-left",     t: "Historial",        d: "Reproduce el recorrido completo de cualquier día. Detalles de paradas, ralentí y velocidades." },
    { i: "fa-shield-halved",         t: "Central 24/7",     d: "Operadores humanos en línea las 24 horas. Coordinación directa con autoridades cuando se requiere." },
  ]
  return (
    <section id="caracteristicas" className="l-section">
      <div className="l-section-head">
        <span className="eyebrow">Capacidades</span>
        <h2 className="h-display" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)", margin: ".5rem 0 .8rem" }}>
          Una plataforma. <span style={{ color: "var(--accent)" }}>Control total.</span>
        </h2>
        <p style={{ color: "var(--text-soft)", maxWidth: 600, margin: "0 auto", fontSize: "1.02rem" }}>
          Todo lo que necesitas para proteger un vehículo personal o una flota entera. Sin contratos eternos, sin sorpresas.
        </p>
      </div>
      <div className="l-feat-grid">
        {items.map((f, i) => (
          <div key={i} className="surface-card l-feat">
            <div className="l-feat-icon"><i className={`fa-solid ${f.i}`} /></div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.15rem", fontWeight: 700, marginBottom: ".5rem" }}>{f.t}</h3>
            <p style={{ color: "var(--text-soft)", fontSize: ".93rem" }}>{f.d}</p>
            <div className="l-feat-corner mono">0{i + 1}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PlatformPreview() {
  return (
    <section id="plataforma" className="l-section l-platform">
      <div className="l-platform-head">
        <span className="eyebrow">La plataforma</span>
        <h2 className="h-display" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)", margin: ".5rem 0" }}>
          Diseñada para conductores. <span style={{ color: "var(--accent)" }}>Aprobada por flotas.</span>
        </h2>
      </div>
      <div className="surface-card l-platform-shot">
        <div className="l-pm-bar">
          <div className="l-pm-dots"><span /><span /><span /></div>
          <div className="mono" style={{ fontSize: ".78rem", color: "var(--muted-on)" }}>app.halconsat.com / dashboard</div>
          <span className="pill pill-success" style={{ fontSize: ".68rem" }}>
            <span className="pulse" />LIVE
          </span>
        </div>
        <div className="l-fake-dashboard">
          <span className="label">▟  Captura del Panel de Cliente — mapa + alertas + viajes del día  ▙</span>
        </div>
      </div>
    </section>
  )
}

function Steps() {
  const steps = [
    { n: "01", t: "Instalación profesional",   d: "Nuestros técnicos certificados visitan tu ubicación e instalan el dispositivo GPS de forma discreta. 45 minutos.", i: "fa-screwdriver-wrench" },
    { n: "02", t: "Configuración personalizada", d: "Definimos geocercas, contactos de emergencia, alertas y permisos según tu uso real del vehículo.", i: "fa-sliders" },
    { n: "03", t: "Monitoreo continuo",        d: "Tu app activa en minutos. Central 24/7 respaldando cada movimiento. Sin permanencias forzadas.", i: "fa-satellite-dish" },
  ]
  return (
    <section id="pasos" className="l-section l-steps-section">
      <div className="l-section-head" style={{ textAlign: "left", maxWidth: 1240, margin: "0 auto 3rem" }}>
        <span className="eyebrow">El proceso</span>
        <h2 className="h-display" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)", margin: ".5rem 0" }}>
          Tres pasos. <span style={{ color: "var(--accent)" }}>Cero complicaciones.</span>
        </h2>
      </div>
      <div className="l-steps-grid">
        {steps.map((s, i) => (
          <div key={i} className="surface-card l-step">
            <div className="l-step-top">
              <span className="mono" style={{ fontSize: "2.6rem", fontWeight: 600, color: "var(--accent)", letterSpacing: "-.04em" }}>{s.n}</span>
              <div className="l-step-icon"><i className={`fa-solid ${s.i}`} /></div>
            </div>
            <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "1.25rem", fontWeight: 700, marginTop: "1rem", marginBottom: ".5rem" }}>{s.t}</h3>
            <p style={{ color: "var(--text-soft)", fontSize: ".95rem" }}>{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function ContactRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: ".9rem" }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        background: "color-mix(in oklab, var(--accent) 14%, transparent)",
        color: "var(--accent)", display: "grid", placeItems: "center",
      }}>
        <i className={`fa-solid ${icon}`} />
      </div>
      <div>
        <div style={{ fontSize: ".7rem", color: "var(--muted-on)", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</div>
        <div style={{ fontFamily: "'JetBrains Mono', ui-monospace, monospace", fontSize: ".95rem", fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  )
}

function Cta() {
  return (
    <section id="contacto" className="l-cta">
      <div className="l-cta-grid">
        <div>
          <span className="eyebrow">Empieza hoy</span>
          <h2 className="h-display" style={{ fontSize: "clamp(2rem, 3.4vw, 3rem)", margin: ".6rem 0 1rem" }}>
            Listo para tener<br /><span style={{ color: "var(--accent)" }}>la calma en tu bolsillo.</span>
          </h2>
          <p style={{ color: "var(--text-soft)", maxWidth: 460, fontSize: "1rem" }}>
            Cotización en menos de 5 minutos. Instalación en 24-48 horas. Sin permanencia.
          </p>
          <div style={{ display: "flex", gap: ".85rem", marginTop: "1.6rem", flexWrap: "wrap" }}>
            <a href="https://wa.me/593999999999" className="btn btn-primary">Solicitar cotización</a>
            <Link href="/login" className="btn btn-ghost">Ver demo de la plataforma</Link>
          </div>
        </div>
        <div className="surface-card l-cta-card">
          <div className="mono" style={{ fontSize: ".72rem", color: "var(--muted-on)", letterSpacing: ".06em" }}>CONTACTO DIRECTO</div>
          <div style={{ marginTop: "1.2rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <ContactRow icon="fa-phone" label="Línea principal" value="+593 99 999 9999" />
            <ContactRow icon="fa-envelope" label="Correo" value="hola@halconsat.com" />
            <ContactRow icon="fa-location-dot" label="Oficina" value="Ibarra, Imbabura — Ecuador" />
            <ContactRow icon="fa-clock" label="Atención" value="24 / 7 todos los días" />
          </div>
        </div>
      </div>
    </section>
  )
}

function FooterCol({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="l-footer-col">
      <h4>{title}</h4>
      <ul>
        {items.map((x, i) => <li key={i}><a href="#">{x}</a></li>)}
      </ul>
    </div>
  )
}

function Footer() {
  return (
    <footer className="l-footer">
      <div className="l-footer-top">
        <div>
          <Logo />
          <p style={{ color: "var(--text-soft)", marginTop: "1rem", maxWidth: 320, fontSize: ".92rem" }}>
            Tecnología satelital aplicada a la seguridad. Hecho en Ecuador, pensado para tu tranquilidad.
          </p>
          <div className="l-social">
            {["facebook-f", "instagram", "linkedin-in", "whatsapp"].map((s, i) => (
              <a key={i} href="#" aria-label={s}><i className={`fa-brands fa-${s}`} /></a>
            ))}
          </div>
        </div>
        <FooterCol title="Producto" items={["Plataforma web", "App móvil", "Hardware GPS", "Para flotas"]} />
        <FooterCol title="Empresa" items={["Nosotros", "Casos de éxito", "Soporte", "Blog"]} />
        <FooterCol title="Legal" items={["Términos", "Privacidad", "Protección de datos", "Cookies"]} />
      </div>
      <div className="l-footer-bottom">
        <span>© 2026 HalconSat — Seguridad Vehicular Avanzada.</span>
        <span className="mono">v 4.2.1 · build 2026.05</span>
      </div>
    </footer>
  )
}

export default function LandingPage() {
  return (
    <div className="landing-root">
      <BrandHead />
      <Nav />
      <Hero />
      <Marquee />
      <Features />
      <PlatformPreview />
      <Steps />
      <Cta />
      <Footer />
      <ChatWidget />
    </div>
  )
}
