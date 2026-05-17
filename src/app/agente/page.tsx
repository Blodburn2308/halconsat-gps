"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, SessionProvider } from "next-auth/react"
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

interface Mensaje {
  role: "user" | "assistant"
  content: string
  meta?: {
    registros_usados: number
    latencia_total_ms: number
  }
}

const PREGUNTAS_RAPIDAS = [
  "¿Cuántos registros GPS tengo?",
  "¿Cuáles fueron mis últimas alertas?",
  "¿Tengo registros con velocidad alta?",
  "¿Cuál fue mi último evento registrado?",
  "¿Tengo alertas de robo registradas?",
  "¿Qué vehículos están activos?",
]

function AgenteChat() {
  const { data: session } = useSession()
  const role = (session?.user as any)?.role
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      role: "assistant",
      content: `¡Hola${session?.user?.name ? ", " + session.user.name.split(" ")[0] : ""}! 👋 Soy el agente de HalconSat. Puedo consultar tus registros GPS y responder preguntas sobre tu flota vehicular. ¿En qué te ayudo?`,
    },
  ])
  const [input, setInput] = useState("")
  const [cargando, setCargando] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [mensajes, cargando])

  const enviar = async (texto?: string) => {
    const pregunta = (texto || input).trim()
    if (!pregunta || cargando) return

    const nuevosMensajes: Mensaje[] = [
      ...mensajes,
      { role: "user", content: pregunta },
    ]
    setMensajes(nuevosMensajes)
    setInput("")
    setCargando(true)

    try {
      const historial = nuevosMensajes.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch("/api/agente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, historial }),
      })

      const data = await res.json()

      if (data.error) {
        setMensajes(prev => [...prev, { role: "assistant", content: `⚠️ ${data.error}` }])
        return
      }

      setMensajes(prev => [...prev, {
        role: "assistant",
        content: data.respuesta,
        meta: {
          registros_usados: data.registros_usados,
          latencia_total_ms: data.latencia_total_ms,
        },
      }])
    } catch {
      setMensajes(prev => [...prev, {
        role: "assistant",
        content: "Hubo un error de conexión. Verifica que el backend Python esté corriendo.",
      }])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
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
            href={role === "admin" ? "/dashboard/admin" : "/dashboard/cliente"}
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
              Inteligencia · Tiempo real
            </div>
            <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.45rem", fontWeight: 700, marginTop: 2 }}>
              Agente IA
            </h1>
          </div>
        </div>
        <span
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            border: `1px solid color-mix(in oklab, ${ACCENT} 35%, transparent)`,
            background: `color-mix(in oklab, ${ACCENT} 14%, transparent)`,
            color: ACCENT, fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em",
          }}
        >
          <i className={role === "admin" ? "fa-solid fa-user-shield" : "fa-solid fa-user"} />
          {role?.toUpperCase() ?? "USUARIO"}
        </span>
      </header>

      {/* Chat container */}
      <div className="flex-1 px-4 md:px-10 py-6 w-full max-w-4xl mx-auto flex flex-col gap-4">

        {/* Quick replies */}
        <div className="flex flex-wrap gap-2">
          {PREGUNTAS_RAPIDAS.map((p, i) => (
            <button
              key={i}
              onClick={() => enviar(p)}
              disabled={cargando}
              className="px-3 py-1.5 rounded-full transition-all disabled:opacity-40"
              style={{
                background: CARD_2,
                border: `1px solid ${BORDER}`,
                color: TEXT_SOFT,
                fontSize: "0.74rem",
                fontWeight: 500,
              }}
              onMouseEnter={(e) => {
                if (cargando) return
                e.currentTarget.style.borderColor = ACCENT
                e.currentTarget.style.color = ACCENT
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = BORDER
                e.currentTarget.style.color = TEXT_SOFT
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Chat surface */}
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{
            background: CARD,
            border: `1px solid ${HAIRLINE}`,
            borderRadius: 16,
            boxShadow: "0 8px 28px rgba(0,0,0,0.18)",
          }}
        >
          {/* Mensajes */}
          <div
            ref={bodyRef}
            className="flex-1 overflow-y-auto p-5 space-y-4"
            style={{ minHeight: 420, maxHeight: 520 }}
          >
            {mensajes.map((m, i) => {
              const isUser = m.role === "user"
              return (
                <div key={i} className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div
                    className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                    style={isUser
                      ? { background: CARD_2, color: TEXT_SOFT, border: `1px solid ${BORDER}` }
                      : { background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`, color: "#0a0a0a" }
                    }
                  >
                    <i className={isUser ? "fa-solid fa-user" : "fa-solid fa-robot"} />
                  </div>

                  {/* Burbuja */}
                  <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className="px-4 py-3 text-sm leading-relaxed"
                      style={isUser
                        ? {
                            background: ACCENT,
                            color: "#0a0a0a",
                            borderRadius: "16px 16px 4px 16px",
                            fontWeight: 500,
                          }
                        : {
                            background: CARD_2,
                            color: TEXT,
                            border: `1px solid ${HAIRLINE}`,
                            borderRadius: "16px 16px 16px 4px",
                          }
                      }
                    >
                      {m.content}
                    </div>

                    {/* Meta */}
                    {!isUser && m.meta && (
                      <div className="flex gap-3 mt-1.5" style={{ fontSize: "0.7rem", color: MUTED }}>
                        <span className="inline-flex items-center gap-1">
                          <i className="fa-solid fa-database" />
                          <span style={{ fontFamily: FONT_MONO }}>{m.meta.registros_usados}</span>
                          registros
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <i className="fa-solid fa-bolt" />
                          <span style={{ fontFamily: FONT_MONO }}>{m.meta.latencia_total_ms}ms</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* Typing indicator */}
            {cargando && (
              <div className="flex gap-3">
                <div
                  className="w-9 h-9 rounded-[10px] grid place-items-center shrink-0"
                  style={{ background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`, color: "#0a0a0a" }}
                >
                  <i className="fa-solid fa-robot" />
                </div>
                <div
                  className="px-4 py-3"
                  style={{
                    background: CARD_2,
                    border: `1px solid ${HAIRLINE}`,
                    borderRadius: "16px 16px 16px 4px",
                  }}
                >
                  <div className="flex gap-1 items-center h-5">
                    {[0, 150, 300].map(delay => (
                      <div
                        key={delay}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: ACCENT,
                          opacity: 0.7,
                          animation: `agbounce 1.2s ease-in-out infinite`,
                          animationDelay: `${delay}ms`,
                        }}
                      />
                    ))}
                  </div>
                </div>
                <style>{`
                  @keyframes agbounce {
                    0%, 80%, 100% { transform: translateY(0); }
                    40% { transform: translateY(-6px); }
                  }
                `}</style>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            className="border-t flex gap-2 p-3"
            style={{ borderColor: HAIRLINE, background: SURFACE }}
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
              placeholder="Pregunta sobre tus registros GPS..."
              disabled={cargando}
              className="flex-1 px-4 py-2.5 rounded-[10px] outline-none transition-colors disabled:opacity-50"
              style={{
                background: CARD_2,
                border: `1px solid ${BORDER}`,
                color: TEXT,
                fontSize: "0.88rem",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = ACCENT }}
              onBlur={(e) => { e.currentTarget.style.borderColor = BORDER }}
            />
            <button
              onClick={() => enviar()}
              disabled={cargando || !input.trim()}
              className="inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: ACCENT, color: "#0a0a0a",
                fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "0.85rem",
                boxShadow: "0 6px 20px rgba(255,154,0,0.25)",
              }}
            >
              {cargando ? "..." : (<>Enviar <i className="fa-solid fa-paper-plane" /></>)}
            </button>
          </div>
        </div>

        {/* Footer info */}
        <p style={{ fontSize: "0.72rem", color: MUTED, textAlign: "center" }}>
          El agente busca semánticamente en <span style={{ fontFamily: FONT_MONO, color: ACCENT }}>ChromaDB</span> y usa{" "}
          <span style={{ fontFamily: FONT_MONO, color: ACCENT }}>Groq</span> para generar respuestas basadas en tus datos reales.
        </p>
      </div>
    </div>
  )
}

export default function AgentePage() {
  return (
    <SessionProvider>
      <AgenteChat />
    </SessionProvider>
  )
}
