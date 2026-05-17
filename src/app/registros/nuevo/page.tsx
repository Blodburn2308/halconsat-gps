"use client"

import { useState } from "react"
import Link from "next/link"

// ─── Brand tokens ─────────────────────────────────────────────────────────
const BG          = "#080c14"
const SURFACE     = "#0d1321"
const CARD        = "#111827"
const CARD_2      = "#161f30"
const HAIRLINE    = "rgba(255,255,255,0.06)"
const BORDER      = "rgba(255,255,255,0.08)"
const TEXT        = "#e8eaf0"
const TEXT_SOFT   = "#b6bdcc"
const MUTED       = "#8892a4"
const ACCENT      = "#ff9a00"
const ACCENT_DIM  = "#cc7b00"
const SUCCESS     = "#16a34a"
const DANGER      = "#e0392b"

const FONT_DISPLAY = "'Syne', system-ui, sans-serif"
const FONT_BODY    = "'DM Sans', system-ui, sans-serif"
const FONT_MONO    = "'JetBrains Mono', ui-monospace, monospace"

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

type Estado = "ok" | "error" | null

interface Resumen {
  id: string
  latencia_ms: number | null
  fecha_hora: string | null
}

const TIPOS_EVENTO = [
  "Encendido",
  "Apagado",
  "Movimiento",
  "Geocerca-Salida",
  "Geocerca-Entrada",
  "Exceso-Velocidad",
  "Panico",
  "Sensor-Movimiento",
]

const ESTADOS_DISPOSITIVO = ["activo", "inactivo", "mantenimiento", "alerta"]

const FORM_INICIAL = {
  dispositivo_id: "",
  placa: "",
  tipo_evento: TIPOS_EVENTO[0],
  ubicacion: "",
  descripcion: "",
  estado_dispositivo: ESTADOS_DISPOSITIVO[0],
  velocidad: "0",
}

const cardStyle: React.CSSProperties = {
  background: CARD,
  border: `1px solid ${HAIRLINE}`,
  borderRadius: 16,
  boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: CARD_2,
  border: `1px solid ${BORDER}`,
  color: TEXT,
  padding: "0.7rem 0.9rem",
  borderRadius: 10,
  fontSize: "0.88rem",
  outline: "none",
  transition: "border-color 0.2s",
}

function Field({ label, htmlFor, badge, children }: {
  label: string
  htmlFor: string
  badge?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={htmlFor}
          style={{ fontSize: "0.78rem", fontWeight: 600, color: TEXT_SOFT }}
        >
          {label}
        </label>
        {badge && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full"
            style={{
              background: `color-mix(in oklab, ${ACCENT} 14%, transparent)`,
              color: ACCENT,
              fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.04em",
              border: `1px solid color-mix(in oklab, ${ACCENT} 35%, transparent)`,
            }}
          >
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export default function NuevoRegistroPage() {
  const [form, setForm] = useState(FORM_INICIAL)
  const [enviando, setEnviando] = useState(false)
  const [estado, setEstado] = useState<Estado>(null)
  const [mensaje, setMensaje] = useState<string>("")
  const [resumen, setResumen] = useState<Resumen | null>(null)

  const set = (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setEstado(null)
    setMensaje("")
    setResumen(null)

    try {
      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setEstado("error")
        setMensaje(data?.error || data?.detail?.error || "Error al guardar el registro")
        return
      }

      setEstado("ok")
      setMensaje("Registro guardado correctamente")
      setResumen({
        id: data.id,
        latencia_ms: data.latencia_ms ?? null,
        fecha_hora: data.fecha_hora ?? null,
      })
      setForm(FORM_INICIAL)
    } catch {
      setEstado("error")
      setMensaje("No se pudo enviar el formulario")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: BG, color: TEXT, fontFamily: FONT_BODY }}
    >
      <BrandHead />

      {/* Top bar */}
      <header
        className="flex items-center justify-between gap-6 px-6 md:px-10 py-5 sticky top-0 z-10"
        style={{ background: BG, borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/cliente"
            className="inline-flex items-center gap-2 rounded-[10px] px-3 py-2 transition-colors"
            style={{
              border: `1px solid ${BORDER}`, color: TEXT_SOFT, fontSize: "0.82rem",
            }}
          >
            <i className="fa-solid fa-arrow-left" /> Volver
          </Link>
          <div>
            <div style={{
              fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em",
              textTransform: "uppercase", color: ACCENT,
            }}>
              Captura · ChromaDB
            </div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.45rem", fontWeight: 700, marginTop: 2 }}>
              Nuevo Registro GPS
            </h1>
            <p style={{ fontSize: "0.82rem", color: MUTED, marginTop: 2 }}>
              Captura un evento de dispositivo y guárdalo en la base vectorial.
            </p>
          </div>
        </div>
      </header>

      <div className="px-6 md:px-10 py-6 max-w-3xl mx-auto space-y-5">

        {/* Resumen de inserción exitosa */}
        {estado === "ok" && resumen && (
          <div style={{
            ...cardStyle,
            borderColor: `color-mix(in oklab, ${SUCCESS} 35%, transparent)`,
            background: `color-mix(in oklab, ${SUCCESS} 7%, ${CARD})`,
            padding: "1.4rem",
          }}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <div
                  className="w-11 h-11 rounded-[12px] grid place-items-center"
                  style={{
                    background: `color-mix(in oklab, ${SUCCESS} 18%, transparent)`,
                    color: SUCCESS, fontSize: "1.2rem",
                  }}
                >
                  <i className="fa-solid fa-circle-check" />
                </div>
                <div>
                  <p style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, color: TEXT, fontSize: "1rem" }}>
                    Registro guardado correctamente
                  </p>
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full mt-2"
                    style={{
                      background: `color-mix(in oklab, ${ACCENT} 14%, transparent)`,
                      color: ACCENT,
                      fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.02em",
                      border: `1px solid color-mix(in oklab, ${ACCENT} 35%, transparent)`,
                    }}
                  >
                    <i className="fa-solid fa-brain" />
                    Vector generado correctamente en ChromaDB
                  </span>
                </div>
              </div>
              <Link
                href="/dashboard/cliente/registros"
                className="inline-flex items-center gap-2 rounded-[12px] px-4 py-2.5 transition-all"
                style={{
                  background: ACCENT, color: "#0a0a0a",
                  fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem",
                  boxShadow: "0 6px 20px rgba(255,154,0,0.25)",
                }}
              >
                Ver mis registros <i className="fa-solid fa-arrow-right" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
              <div style={{
                background: CARD_2, border: `1px solid ${HAIRLINE}`,
                borderRadius: 10, padding: "0.9rem",
              }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 600, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  ID generado
                </p>
                <p style={{
                  fontFamily: FONT_MONO, fontSize: "0.85rem", color: ACCENT,
                  marginTop: 6, wordBreak: "break-all", fontWeight: 600,
                }}>
                  {resumen.id}
                </p>
              </div>
              <div style={{
                background: CARD_2, border: `1px solid ${HAIRLINE}`,
                borderRadius: 10, padding: "0.9rem",
              }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 600, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Latencia de inserción
                </p>
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.95rem", color: TEXT, marginTop: 6, fontWeight: 600 }}>
                  {resumen.latencia_ms != null
                    ? <>{resumen.latencia_ms}<span style={{ color: MUTED, fontWeight: 500, marginLeft: 4 }}>ms</span></>
                    : "—"}
                </p>
              </div>
              <div style={{
                background: CARD_2, border: `1px solid ${HAIRLINE}`,
                borderRadius: 10, padding: "0.9rem",
              }}>
                <p style={{ fontSize: "0.62rem", fontWeight: 600, color: MUTED, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Fecha y hora
                </p>
                <p style={{ fontFamily: FONT_MONO, fontSize: "0.78rem", color: TEXT_SOFT, marginTop: 6 }}>
                  {resumen.fecha_hora
                    ? new Date(resumen.fecha_hora).toLocaleString("es-EC")
                    : "—"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={enviar} style={{ ...cardStyle, padding: "1.6rem" }} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Field label="Dispositivo ID" htmlFor="dispositivo_id">
              <input
                id="dispositivo_id"
                required
                placeholder="GPS-001"
                value={form.dispositivo_id}
                onChange={set("dispositivo_id")}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
              />
            </Field>

            <Field label="Placa" htmlFor="placa">
              <input
                id="placa"
                required
                placeholder="PCD-1234"
                value={form.placa}
                onChange={set("placa")}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
              />
            </Field>

            <Field label="Tipo de evento" htmlFor="tipo_evento">
              <select
                id="tipo_evento"
                value={form.tipo_evento}
                onChange={set("tipo_evento")}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
              >
                {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>

            <Field label="Estado del dispositivo" htmlFor="estado_dispositivo">
              <select
                id="estado_dispositivo"
                value={form.estado_dispositivo}
                onChange={set("estado_dispositivo")}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
              >
                {ESTADOS_DISPOSITIVO.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>

            <div className="md:col-span-2">
              <Field label="Ubicación" htmlFor="ubicacion">
                <input
                  id="ubicacion"
                  required
                  placeholder="Av. Atahualpa y Cristóbal de Troya, Ibarra"
                  value={form.ubicacion}
                  onChange={set("ubicacion")}
                  style={inputStyle}
                  onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                />
              </Field>
            </div>

            <div className="md:col-span-2">
              <Field label="Descripción" htmlFor="descripcion" badge="SE CONVIERTE EN VECTOR">
                <textarea
                  id="descripcion"
                  required
                  rows={3}
                  placeholder="Vehículo salió de la zona segura a las 14:32. Ruta hacia el norte."
                  value={form.descripcion}
                  onChange={set("descripcion")}
                  style={{ ...inputStyle, resize: "vertical", minHeight: 80 }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                  onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
                />
              </Field>
            </div>

            <Field label="Velocidad (km/h)" htmlFor="velocidad">
              <input
                id="velocidad"
                type="number"
                min={0}
                step="0.1"
                required
                value={form.velocidad}
                onChange={set("velocidad")}
                style={inputStyle}
                onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
                onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
              />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2 flex-wrap">
            <button
              type="submit"
              disabled={enviando}
              className="inline-flex items-center gap-2 rounded-[12px] px-5 py-3 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: ACCENT, color: "#0a0a0a",
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.9rem",
                boxShadow: "0 10px 30px rgba(255,154,0,0.25)",
              }}
            >
              {enviando ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin" /> Guardando…
                </>
              ) : (
                <>
                  <i className="fa-solid fa-floppy-disk" /> Guardar registro
                </>
              )}
            </button>

            {estado === "error" && (
              <div className="inline-flex items-center gap-2">
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{
                    background: `color-mix(in oklab, ${DANGER} 14%, transparent)`,
                    color: DANGER,
                    fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.04em",
                    border: `1px solid color-mix(in oklab, ${DANGER} 35%, transparent)`,
                  }}
                >
                  <i className="fa-solid fa-triangle-exclamation" /> ERROR
                </span>
                <span style={{ fontSize: "0.85rem", color: TEXT_SOFT }}>{mensaje}</span>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
