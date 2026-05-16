"use client"

import { useState, useRef, useEffect } from "react"

interface Mensaje {
  role: "user" | "assistant"
  content: string
}

export default function ChatWidget() {
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy el agente de HalconSat 🛰️ ¿En qué puedo ayudarte hoy? Puedo contarte sobre nuestros servicios de rastreo GPS, planes y más."
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

  const enviar = async () => {
    const texto = input.trim()
    if (!texto || cargando) return

    const nuevosMensajes: Mensaje[] = [...mensajes, { role: "user", content: texto }]
    setMensajes(nuevosMensajes)
    setInput("")
    setCargando(true)

    try {
      const historial = nuevosMensajes.slice(0, -1).map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content
      }))

      const res = await fetch("/api/chat-publico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: texto, historial })
      })

      const data = await res.json()
      setMensajes(prev => [...prev, { role: "assistant", content: data.respuesta }])
    } catch {
      setMensajes(prev => [
        ...prev,
        { role: "assistant", content: "Hubo un error. Escríbenos al WhatsApp." }
      ])
    } finally {
      setCargando(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  return (
    <div className="hs-chat-fab">
      <div className={`hs-chat-window ${abierto ? "open" : ""}`}>
        <div className="hs-chat-header">
          <div className="hs-chat-header-info">
            <div className="hs-chat-avatar">🤖</div>
            <div>
              <h4>Agente HalconSat</h4>
              <div className="hs-chat-status">En línea</div>
            </div>
          </div>
          <button className="hs-chat-close" onClick={() => setAbierto(false)}>✕</button>
        </div>

        <div className="hs-chat-body" ref={bodyRef}>
          {mensajes.map((m, i) => (
            <div key={i} className={`hs-msg ${m.role === "assistant" ? "bot" : "user"}`}>
              {m.role === "assistant" && (
                <div className="hs-msg-icon">🤖</div>
              )}
              <div className="hs-msg-bubble">{m.content}</div>
            </div>
          ))}

          {cargando && (
            <div className="hs-msg bot">
              <div className="hs-msg-icon">🤖</div>
              <div className="hs-msg-bubble">
                <div className="hs-typing">
                  <span /><span /><span />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="hs-chat-footer">
          <input
            type="text"
            className="hs-chat-input"
            placeholder="Escribe tu mensaje…"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={cargando}
          />
          <button className="hs-chat-send" onClick={enviar} disabled={cargando}>
            ➤
          </button>
        </div>
      </div>

      <button
        className="hs-chat-toggle"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir chat"
      >
        {abierto ? "✕" : "💬"}
      </button>
    </div>
  )
}
