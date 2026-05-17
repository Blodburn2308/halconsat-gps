"use client"

import { useEffect, useState } from "react"
import { SessionProvider } from "next-auth/react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface Metricas {
  total_registros: number
  registros_por_usuario: Record<string, number>
  latencia_promedio_ms: number
  errores: number
  exitosos: number
  tasa_exito: number
  vectores_almacenados: number
  dimension_vector: number
  uso_mb: number
  duplicados_detectados: number
  consultas_agente: number
  latencia_agente_ms: number
  similitud_promedio: number
  registros_por_dia: Record<string, number>
  latencias_lista: number[]
}

// ─── Brand tokens ─────────────────────────────────────────────────────────
const BG       = "#080c14"
const SURFACE  = "#0d1321"
const CARD     = "#111827"
const CARD_2   = "#161f30"
const HAIRLINE = "rgba(255,255,255,0.06)"
const BORDER   = "rgba(255,255,255,0.08)"
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

function Kpi({ label, value, sub, icon, tone = "accent", big = false }: {
  label: string
  value: string | number
  sub?: string
  icon: string
  tone?: "accent" | "success" | "warning" | "danger" | "info" | "violet"
  big?: boolean
}) {
  const tones: Record<string, string> = {
    accent:  ACCENT,
    success: SUCCESS,
    warning: WARNING,
    danger:  DANGER,
    info:    INFO,
    violet:  "#a78bfa",
  }
  const color = tones[tone] ?? ACCENT
  return (
    <div style={{ ...cardStyle, padding: big ? "1.5rem 1.6rem" : "1.1rem 1.25rem" }}>
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
        fontFamily: FONT_MONO, fontWeight: 600,
        fontSize: big ? "2.6rem" : "1.85rem",
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

function AdminContent() {
  const [m, setM] = useState<Metricas | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/metricas")
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(true)
        else setM(data)
      })
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <div className="p-8">
      <div style={{
        ...cardStyle,
        padding: "1.5rem",
        borderColor: `color-mix(in oklab, ${WARNING} 35%, transparent)`,
        background: `color-mix(in oklab, ${WARNING} 6%, ${CARD})`,
      }} className="text-center">
        <p style={{ color: WARNING, fontWeight: 600, fontSize: "1rem" }}>
          <i className="fa-solid fa-triangle-exclamation mr-2" /> Backend Python no disponible
        </p>
        <p style={{ color: MUTED, fontSize: "0.85rem", marginTop: "0.5rem" }}>
          Ejecuta:{" "}
          <code style={{ background: CARD_2, padding: "2px 8px", borderRadius: 6, fontFamily: FONT_MONO }}>
            cd backend && uvicorn main:app --reload
          </code>
        </p>
      </div>
    </div>
  )

  if (!m) return (
    <div className="p-8 flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div
          className="w-9 h-9 rounded-full mx-auto"
          style={{
            border: `3px solid ${HAIRLINE}`,
            borderTopColor: ACCENT,
            animation: "spin 0.9s linear infinite",
          }}
        />
        <p style={{ color: MUTED, fontSize: "0.85rem" }}>Cargando métricas del sistema...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )

  // Datos para gráficas
  const dataPorUsuario = Object.entries(m.registros_por_usuario).map(([email, count]) => ({
    name: email.split("@")[0],
    registros: count,
  }))
  const dataTorta = [
    { name: "Exitosos", value: m.exitosos, color: SUCCESS },
    { name: "Errores",  value: m.errores || 0, color: DANGER },
  ]
  const dataLatencias = m.latencias_lista.map((lat, i) => ({ insercion: i + 1, ms: lat }))
  const dataPorDia = Object.entries(m.registros_por_dia).map(([dia, count]) => ({
    dia: dia.slice(5),
    registros: count,
  }))

  return (
    <div>
      {/* Top bar */}
      <div
        className="flex items-center justify-between gap-6 px-8 py-5 sticky top-0 z-10"
        style={{ background: BG, borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div>
          <Eyebrow>Operación · Tiempo real</Eyebrow>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.55rem", fontWeight: 700, marginTop: 4 }}>
            Dashboard General
          </h1>
          <p style={{ fontSize: "0.82rem", color: MUTED, marginTop: 2 }}>
            Sistema Halconsat GPS · vista completa
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{
              border: `1px solid color-mix(in oklab, ${ACCENT} 35%, transparent)`,
              background: `color-mix(in oklab, ${ACCENT} 14%, transparent)`,
              color: ACCENT, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em",
            }}
          >
            <i className="fa-solid fa-user-shield" /> ADMINISTRADOR
          </span>
        </div>
      </div>

      <div className="px-8 py-6 space-y-7">

        {/* ── RESUMEN GENERAL ── */}
        <div>
          <SectionTitle>Resumen General</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Kpi label="① Total Registros GPS" value={m.total_registros} sub="vectores en ChromaDB" icon="fa-location-dot" tone="accent" />
            <Kpi label="④ Errores de ingreso"    value={m.errores}        sub="registros fallidos" icon="fa-triangle-exclamation" tone={m.errores > 0 ? "danger" : "success"} />
            <Kpi label="⑤ Tasa de Éxito"          value={`${m.tasa_exito}%`} sub={`${m.exitosos} exitosos`} icon="fa-circle-check" tone={m.tasa_exito >= 90 ? "success" : "warning"} />
            <Kpi label="⑦ Consultas al Agente"    value={m.consultas_agente} sub="mensajes procesados" icon="fa-robot" tone="violet" />
          </div>
        </div>

        {/* ── RENDIMIENTO VECTORIAL ── */}
        <div>
          <SectionTitle>Rendimiento de la Base Vectorial</SectionTitle>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Kpi label="③ Latencia de Inserción" value={`${m.latencia_promedio_ms} ms`} sub="promedio por registro" icon="fa-bolt" tone={m.latencia_promedio_ms < 500 ? "success" : "warning"} />
            <Kpi label="⑥ Latencia Agente"        value={`${m.latencia_agente_ms} ms`}   sub="consulta semántica + IA" icon="fa-magnifying-glass" tone="info" />
            <Kpi label="⑩ Almacenamiento Vectorial" value={`${m.uso_mb} MB`} sub={`${m.vectores_almacenados} vectores × ${m.dimension_vector}D`} icon="fa-brain" tone="accent" />
          </div>
        </div>

        {/* ── ACTIVIDAD ── */}
        <div>
          <SectionTitle>② Actividad por Usuario</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <div style={{ ...cardStyle, padding: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: TEXT, marginBottom: "1rem" }}>
                Registros por usuario
              </p>
              {dataPorUsuario.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dataPorUsuario}>
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: MUTED }} stroke={HAIRLINE} />
                    <YAxis tick={{ fontSize: 11, fill: MUTED }} stroke={HAIRLINE} />
                    <Tooltip
                      contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT }}
                      cursor={{ fill: `color-mix(in oklab, ${ACCENT} 8%, transparent)` }}
                    />
                    <Bar dataKey="registros" fill={ACCENT} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 grid place-items-center" style={{ color: MUTED, fontSize: "0.85rem" }}>
                  Sin registros aún
                </div>
              )}
            </div>

            <div style={{ ...cardStyle, padding: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: TEXT, marginBottom: "1rem" }}>
                Registros por día
              </p>
              {dataPorDia.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dataPorDia}>
                    <XAxis dataKey="dia" tick={{ fontSize: 11, fill: MUTED }} stroke={HAIRLINE} />
                    <YAxis tick={{ fontSize: 11, fill: MUTED }} stroke={HAIRLINE} />
                    <Tooltip
                      contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT }}
                      cursor={{ fill: `color-mix(in oklab, ${SUCCESS} 8%, transparent)` }}
                    />
                    <Bar dataKey="registros" fill={SUCCESS} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 grid place-items-center" style={{ color: MUTED, fontSize: "0.85rem" }}>
                  Sin datos de días aún
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── CALIDAD ── */}
        <div>
          <SectionTitle>Calidad de los Datos</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <div style={{ ...cardStyle, padding: "1.25rem" }}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: TEXT, marginBottom: "1rem" }}>
                ⑤ Distribución exitosos / errores
              </p>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width="50%" height={160}>
                  <PieChart>
                    <Pie data={dataTorta} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" stroke={SURFACE}>
                      {dataTorta.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2">
                  {dataTorta.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                      <span style={{ fontSize: "0.85rem", color: TEXT }}>
                        {d.name}: <strong style={{ fontFamily: FONT_MONO }}>{d.value}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <Kpi
                label="⑧ Similitud promedio en búsquedas"
                value={`${(m.similitud_promedio * 100).toFixed(0)}%`}
                sub="precisión de recuperación semántica"
                icon="fa-bullseye"
                tone="success"
              />
              <Kpi
                label="⑨ Duplicados detectados"
                value={m.duplicados_detectados}
                sub="registros con similitud > 92%"
                icon="fa-clone"
                tone={m.duplicados_detectados > 0 ? "warning" : "success"}
              />
            </div>
          </div>
        </div>

        {/* ── LATENCIAS ── */}
        {dataLatencias.length > 1 && (
          <div>
            <SectionTitle>③ Latencia de Inserción — últimas {dataLatencias.length} operaciones</SectionTitle>
            <div style={{ ...cardStyle, padding: "1.25rem" }}>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={dataLatencias}>
                  <XAxis dataKey="insercion" tick={{ fontSize: 11, fill: MUTED }} stroke={HAIRLINE}
                         label={{ value: "Inserción #", position: "insideBottom", offset: -2, fill: MUTED, fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11, fill: MUTED }} stroke={HAIRLINE} unit="ms" />
                  <Tooltip
                    contentStyle={{ background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 8, color: TEXT }}
                    formatter={(v) => [`${v} ms`, "Latencia"]}
                  />
                  <Line type="monotone" dataKey="ms" stroke={ACCENT} strokeWidth={2}
                        dot={{ fill: ACCENT, r: 4, stroke: SURFACE, strokeWidth: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── DESGLOSE TABLA ── */}
        {Object.keys(m.registros_por_usuario).length > 0 && (
          <div>
            <SectionTitle>Desglose por usuario</SectionTitle>
            <div style={{ ...cardStyle, overflow: "hidden" }}>
              <table className="w-full" style={{ fontSize: "0.85rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Usuario", "Registros", "% del total"].map((h, i) => (
                      <th
                        key={h}
                        style={{
                          textAlign: i === 0 ? "left" : "center",
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
                  {Object.entries(m.registros_por_usuario).map(([email, count]) => (
                    <tr key={email} style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
                      <td style={{ padding: "0.85rem 1rem", color: TEXT }}>{email}</td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center", fontFamily: FONT_MONO, color: ACCENT, fontWeight: 600 }}>
                        {count}
                      </td>
                      <td style={{ padding: "0.85rem 1rem", textAlign: "center", color: MUTED, fontFamily: FONT_MONO }}>
                        {m.total_registros > 0
                          ? `${((count / m.total_registros) * 100).toFixed(1)}%`
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default function AdminDashboard() {
  return (
    <SessionProvider>
      <AdminContent />
    </SessionProvider>
  )
}
