"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, SessionProvider } from "next-auth/react"
import { Badge } from "@/components/ui/badge"

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
      content: `¡Hola${session?.user?.name ? ", " + session.user.name.split(" ")[0] : ""}! 👋 Soy el agente de HalconSat. Puedo consultar tus registros GPS y responder preguntas sobre tu flota vehicular. ¿En qué te ayudo?`
    }
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
      { role: "user", content: pregunta }
    ]
    setMensajes(nuevosMensajes)
    setInput("")
    setCargando(true)

    try {
      const historial = nuevosMensajes.slice(1, -1).map(m => ({
        role: m.role,
        content: m.content
      }))

      const res = await fetch("/api/agente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pregunta, historial })
      })

      const data = await res.json()

      if (data.error) {
        setMensajes(prev => [...prev, {
          role: "assistant",
          content: `⚠️ ${data.error}`
        }])
        return
      }

      setMensajes(prev => [...prev, {
        role: "assistant",
        content: data.respuesta,
        meta: {
          registros_usados: data.registros_usados,
          latencia_total_ms: data.latencia_total_ms
        }
      }])
    } catch {
      setMensajes(prev => [...prev, {
        role: "assistant",
        content: "Hubo un error de conexión. Verifica que el backend Python esté corriendo."
      }])
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="p-6 h-full flex flex-col max-w-3xl mx-auto gap-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Agente IA</h1>
          <p className="text-sm text-gray-500 mt-1">
            Consulta tus registros GPS en lenguaje natural
          </p>
        </div>
        <Badge className={role === "admin"
          ? "bg-amber-100 text-amber-800 border border-amber-300"
          : "bg-blue-100 text-[#1A3C5E] border border-[#2E86AB]"
        }>
          {role?.toUpperCase()}
        </Badge>
      </div>

      {/* Preguntas rápidas */}
      <div className="flex flex-wrap gap-2">
        {PREGUNTAS_RAPIDAS.map((p, i) => (
          <button
            key={i}
            onClick={() => enviar(p)}
            disabled={cargando}
            className="text-xs px-3 py-1.5 rounded-full border border-[#2E86AB] text-[#2E86AB]
                       hover:bg-[#2E86AB] hover:text-white transition-colors disabled:opacity-40"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Área de chat */}
      <div className="flex-1 flex flex-col bg-white rounded-xl border shadow-sm overflow-hidden">

        {/* Mensajes */}
        <div
          ref={bodyRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[400px] max-h-[500px]"
        >
          {mensajes.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>

              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0
                ${m.role === "assistant"
                  ? "bg-[#1A3C5E] text-white"
                  : "bg-[#2E86AB] text-white"
                }`}>
                {m.role === "assistant" ? "🤖" : "👤"}
              </div>

              {/* Burbuja */}
              <div className={`max-w-[75%] space-y-1 ${m.role === "user" ? "items-end" : "items-start"} flex flex-col`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                  ${m.role === "assistant"
                    ? "bg-gray-50 border border-gray-100 text-gray-800 rounded-tl-sm"
                    : "bg-[#1A3C5E] text-white rounded-tr-sm"
                  }`}>
                  {m.content}
                </div>

                {/* Meta info del agente */}
                {m.role === "assistant" && m.meta && (
                  <div className="flex gap-2 text-xs text-gray-400">
                    <span>📋 {m.meta.registros_usados} registros consultados</span>
                    <span>⚡ {m.meta.latencia_total_ms}ms</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Indicador de escritura */}
          {cargando && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1A3C5E] flex items-center justify-center text-sm shrink-0">
                🤖
              </div>
              <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex gap-1 items-center h-5">
                  {[0, 150, 300].map(delay => (
                    <div
                      key={delay}
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2 bg-gray-50">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && enviar()}
            placeholder="Pregunta sobre tus registros GPS..."
            disabled={cargando}
            className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent
                       disabled:opacity-50 placeholder:text-gray-400"
          />
          <button
            onClick={() => enviar()}
            disabled={cargando || !input.trim()}
            className="bg-[#1A3C5E] hover:bg-[#2E86AB] disabled:opacity-40
                       text-white px-4 py-2.5 rounded-lg text-sm font-medium
                       transition-colors flex items-center gap-2"
          >
            {cargando ? "..." : "Enviar ➤"}
          </button>
        </div>
      </div>

      {/* Info técnica */}
      <p className="text-xs text-gray-400 text-center">
        El agente busca semánticamente en ChromaDB y usa Claude API para generar respuestas basadas en tus datos reales.
      </p>
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
