"use client"

import { useEffect, useState } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import Link from "next/link"

// ─── Brand tokens ─────────────────────────────────────────────────────────
const BG       = "#080c14"
const SURFACE  = "#0d1321"
const CARD     = "#111827"
const CARD_2   = "#161f30"
const HAIRLINE = "rgba(255,255,255,0.06)"
const TEXT     = "#e8eaf0"
const MUTED    = "#8892a4"
const ACCENT   = "#ff9a00"
const SUCCESS  = "#16a34a"
const DANGER   = "#e0392b"
const WARNING  = "#f59e0b"
const INFO     = "#3b82f6"

const FONT_DISPLAY = "'Syne', system-ui, sans-serif"
const FONT_MONO    = "'JetBrains Mono', ui-monospace, monospace"

const cardStyle: React.CSSProperties = {
  background: CARD,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 16,
  boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
      textTransform: "uppercase", color: ACCENT,
    }}>{children}</div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontSize: "0.7rem", fontWeight: 700, color: MUTED,
      letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: "0.85rem",
    }}>{children}</h2>
  )
}

function Kpi({ label, value, sub, icon, tone = "accent" }: {
  label: string
  value: string | number
  sub?: string
  icon: string
  tone?: "accent" | "success" | "violet" | "info"
}) {
  const tones: Record<string, string> = {
    accent: ACCENT, success: SUCCESS, violet: "#a78bfa", info: INFO,
  }
  const color = tones[tone] ?? ACCENT
  return (
    <div style={{ ...cardStyle, padding: "1.1rem 1.25rem" }}>
      <div className="flex items-center justify-between">
        <span style={{
          fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em",
          color: MUTED, fontWeight: 600,
        }}>{label}</span>
        <div
          className="grid place-items-center"
          style={{
            width: 30, height: 30, borderRadius: 8,
            background: `color-mix(in oklab, ${color} 14%, transparent)`,
            color: color, fontSize: "0.85rem",
          }}
        >
          <i className={`fa-solid ${icon}`} />
        </div>
      </div>
      <div style={{
        fontFamily: FONT_MONO, fontWeight: 600, fontSize: "1.85rem",
        marginTop: "0.4rem", letterSpacing: "-0.02em", color: TEXT,
      }}>
        {value}
      </div>
      {sub && (
        <div style={{ marginTop: "0.3rem", fontSize: "0.76rem", color: MUTED, fontWeight: 500 }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function eventoPill(tipo?: string) {
  const t = (tipo || "").toLowerCase()
  let bg = `color-mix(in oklab, ${MUTED} 14%, transparent)`
  let color: string = TEXT
  if (t.includes("robo") || t.includes("panico") || t.includes("sos") || t.includes("alerta")) {
    bg = `color-mix(in oklab, ${DANGER} 14%, transparent)`
    color = DANGER
  } else if (t.includes("geo")) {
    bg = `color-mix(in oklab, ${INFO} 14%, transparent)`
    color = INFO
  } else if (t.includes("exceso")) {
    bg = `color-mix(in oklab, ${WARNING} 14%, transparent)`
    color = WARNING
  }
  return { background: bg, color }
}

function estadoPill(estado?: string) {
  const e = (estado || "").toLowerCase()
  if (e === "activo") return { background: `color-mix(in oklab, ${SUCCESS} 14%, transparent)`, color: SUCCESS }
  if (e === "sin señal" || e === "alerta") return { background: `color-mix(in oklab, ${DANGER} 14%, transparent)`, color: DANGER }
  if (e === "mantenimiento") return { background: `color-mix(in oklab, ${WARNING} 14%, transparent)`, color: WARNING }
  return { background: `color-mix(in oklab, ${MUTED} 14%, transparent)`, color: MUTED }
}

function ClienteContent() {
  const { data: session } = useSession()
  const [m, setM] = useState<any>(null)
  const [registros, setRegistros] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/metricas").then(r => r.json()).then(setM).catch(() => {})
    fetch("/api/registros").then(r => r.json()).then(d => setRegistros(d.registros || [])).catch(() => {})
  }, [])

  const nombre = session?.user?.name?.split(" ")[0] ?? "cliente"

  return (
    <div>
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-6 px-8 py-5 sticky top-0 z-10"
        style={{ background: BG, borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div>
          <Eyebrow>Cliente · Tiempo real</Eyebrow>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.55rem", fontWeight: 700, marginTop: 4 }}>
            Hola {nombre} <span style={{ fontFamily: FONT_DISPLAY }}>👋</span>
          </h1>
          <p style={{ fontSize: "0.82rem", color: MUTED, marginTop: 2 }}>
            Tus dispositivos GPS y eventos recientes
          </p>
        </div>
        <Link
          href="/registros/nuevo"
          className="inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 transition-all"
          style={{
            background: ACCENT, color: "#0a0a0a",
            fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.86rem",
            boxShadow: "0 10px 30px rgba(255,154,0,0.25)",
          }}
        >
          <i className="fa-solid fa-circle-plus" /> Nuevo Registro
        </Link>
      </div>

      <div className="px-8 py-6 space-y-7">

        {/* KPIs */}
        <div>
          <SectionTitle>Resumen</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Kpi
              label="Mis Registros"
              value={m?.total_registros ?? "—"}
              sub="eventos GPS capturados"
              icon="fa-location-dot"
              tone="accent"
            />
            <Kpi
              label="Consultas al Agente"
              value={m?.consultas_agente ?? "—"}
              sub="preguntas procesadas"
              icon="fa-robot"
              tone="violet"
            />
            <Kpi
              label="Tasa de Éxito"
              value={m ? `${m.tasa_exito}%` : "—"}
              sub="inserciones exitosas"
              icon="fa-circle-check"
              tone="success"
            />
          </div>
        </div>

        {/* Últimos registros */}
        <div>
          <SectionTitle>Mis últimos registros GPS</SectionTitle>

          {registros.length === 0 ? (
            <div style={{ ...cardStyle, padding: "2.5rem" }} className="text-center space-y-4">
              <div
                className="w-12 h-12 mx-auto rounded-[14px] grid place-items-center"
                style={{
                  background: `color-mix(in oklab, ${ACCENT} 14%, transparent)`,
                  color: ACCENT, fontSize: "1.4rem",
                }}
              >
                <i className="fa-solid fa-location-dot" />
              </div>
              <p style={{ color: MUTED, fontWeight: 500 }}>No tienes registros GPS aún</p>
              <Link
                href="/registros/nuevo"
                className="inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 transition-all"
                style={{
                  background: ACCENT, color: "#0a0a0a",
                  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.86rem",
                }}
              >
                <i className="fa-solid fa-circle-plus" /> Registrar mi primer evento
              </Link>
            </div>
          ) : (
            <div style={{ ...cardStyle, overflow: "hidden" }}>
              <div className="overflow-x-auto">
                <table className="w-full" style={{ fontSize: "0.85rem", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      {["Dispositivo", "Placa", "Evento", "Estado", "Fecha"].map(h => (
                        <th
                          key={h}
                          style={{
                            textAlign: "left",
                            fontSize: "0.7rem", fontWeight: 600, color: MUTED,
                            textTransform: "uppercase", letterSpacing: "0.08em",
                            padding: "0.9rem 1rem", background: CARD_2,
                            borderBottom: `1px solid ${HAIRLINE}`,
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {registros.slice(0, 8).map((r: any) => {
                      const evp = eventoPill(r.tipo_evento)
                      const esp = estadoPill(r.estado_dispositivo)
                      return (
                        <tr key={r.id} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                          <td style={{ padding: "0.9rem 1rem", fontFamily: FONT_MONO, fontSize: "0.78rem", color: MUTED }}>
                            {r.dispositivo_id}
                          </td>
                          <td style={{ padding: "0.9rem 1rem", color: ACCENT, fontWeight: 600 }}>
                            {r.placa}
                          </td>
                          <td style={{ padding: "0.9rem 1rem" }}>
                            <span
                              className="inline-flex items-center px-2.5 py-1 rounded-full"
                              style={{
                                ...evp,
                                fontSize: "0.72rem", fontWeight: 600, letterSpacing: "0.02em",
                              }}
                            >
                              {r.tipo_evento}
                            </span>
                          </td>
                          <td style={{ padding: "0.9rem 1rem" }}>
                            <span
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                              style={{
                                ...esp,
                                fontSize: "0.72rem", fontWeight: 600,
                              }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "currentColor" }} />
                              {r.estado_dispositivo}
                            </span>
                          </td>
                          <td style={{ padding: "0.9rem 1rem", fontSize: "0.78rem", color: MUTED, fontFamily: FONT_MONO }}>
                            {r.fecha_hora ? new Date(r.fecha_hora).toLocaleString("es-EC") : "—"}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ClienteDashboard() {
  return (
    <SessionProvider>
      <ClienteContent />
    </SessionProvider>
  )
}
