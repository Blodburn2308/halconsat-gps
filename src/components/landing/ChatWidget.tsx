"use client"

import { useState, useRef, useEffect } from "react"

interface Mensaje {
  from: "bot" | "user"
  text: string
  time: string
  quick?: string[]
}

const ahora = () => {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
}

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState<Mensaje[]>([
    { from: "bot", text: "¡Hola! Soy Halcón, el asistente de HalconSat 🦅", time: "08:32" },
    { from: "bot", text: "¿Qué te trae por aquí hoy?", time: "08:32", quick: ["Cotizar instalación", "Ya soy cliente", "Soporte técnico"] },
  ])
  const [input, setInput] = useState("")
  const [typing, setTyping] = useState(false)
  const [cargando, setCargando] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [msgs, typing, open])

  const send = async (texto: string) => {
    const text = texto.trim()
    if (!text || cargando) return

    const t = ahora()
    const nuevos: Mensaje[] = [...msgs, { from: "user", text, time: t }]
    setMsgs(nuevos)
    setInput("")
    setTyping(true)
    setCargando(true)

    try {
      const historial = nuevos.slice(0, -1)
        .filter(m => !m.quick) // no enviamos quick replies como historial
        .map(m => ({
          role: m.from === "bot" ? "assistant" : "user",
          content: m.text,
        }))

      const res = await fetch("/api/chat-publico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensaje: text, historial }),
      })
      const data = await res.json()
      setMsgs(prev => [...prev, {
        from: "bot",
        text: data.respuesta || "Perfecto, te paso con un asesor humano. ¿Prefieres que te llamemos o seguimos por aquí?",
        time: ahora(),
        quick: data.respuesta ? undefined : ["Llamarme", "Seguir chat"],
      }])
    } catch {
      setMsgs(prev => [...prev, {
        from: "bot",
        text: "Hubo un error de conexión. Escríbenos al WhatsApp +593 99 999 9999.",
        time: ahora(),
      }])
    } finally {
      setTyping(false)
      setCargando(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  return (
    <div className="chat-fab">
      <div className={`chat-window ${open ? "is-open" : ""}`}>
        <div className="chat-header">
          <div className="chat-header-info">
            <div className="chat-avatar">
              <i className="fa-solid fa-satellite-dish" />
            </div>
            <div>
              <h4>Halcón · Asistente</h4>
              <div className="chat-status">
                <span className="pulse" />En línea — responde en ~1 min
              </div>
            </div>
          </div>
          <button className="btn-icon" onClick={() => setOpen(false)} aria-label="Cerrar chat">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="chat-body" ref={bodyRef}>
          {msgs.map((m, i) => (
            <div key={i} className={`msg msg-${m.from}`}>
              {m.from === "bot" && (
                <div className="msg-avatar">
                  <i className="fa-solid fa-satellite-dish" />
                </div>
              )}
              <div>
                <div className="msg-bubble">{m.text}</div>
                {m.quick && (
                  <div className="msg-quick">
                    {m.quick.map((q, j) => (
                      <button key={j} onClick={() => send(q)} disabled={cargando}>{q}</button>
                    ))}
                  </div>
                )}
                <div className="msg-time">{m.time}</div>
              </div>
            </div>
          ))}

          {typing && (
            <div className="msg msg-bot">
              <div className="msg-avatar">
                <i className="fa-solid fa-satellite-dish" />
              </div>
              <div className="msg-bubble" style={{ padding: ".65rem 1rem" }}>
                <div className="typing-dots"><span /><span /><span /></div>
              </div>
            </div>
          )}
        </div>

        <form
          className="chat-footer"
          onSubmit={(e) => { e.preventDefault(); send(input) }}
        >
          <button type="button" className="btn-icon" title="Adjuntar">
            <i className="fa-solid fa-paperclip" />
          </button>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Escribe tu mensaje…"
            autoComplete="off"
            disabled={cargando}
          />
          <button type="submit" className="chat-send" disabled={cargando || !input.trim()}>
            <i className="fa-solid fa-paper-plane" />
          </button>
        </form>
      </div>

      <button
        className={`chat-toggle ${open ? "is-open" : ""}`}
        onClick={() => setOpen(o => !o)}
        aria-label={open ? "Cerrar chat" : "Abrir chat"}
      >
        <i className={`fa-solid ${open ? "fa-xmark" : "fa-comments"}`} />
        {!open && <span className="chat-toggle-badge">2</span>}
      </button>
    </div>
  )
}
