# CLAUDE.md — Halconsat GPS · Día 3

## Contexto del proyecto
Aplicación web universitaria para empresa ficticia **Halconsat** (seguridad vehicular GPS).
Landing page, login con roles, dashboard y ChromaDB ya funcionan del Día 1 y 2.
Hoy construimos el agente conversacional que conecta ChromaDB con Claude API.

## Lo que ya existe y funciona
```
src/app/
├── page.tsx                    ✅ landing page
├── login/page.tsx              ✅ auth con roles
├── dashboard/
│   ├── layout.tsx              ✅ sidebar con nav
│   ├── admin/page.tsx          ✅ métricas reales
│   └── cliente/page.tsx        ✅ vista cliente
├── registros/nuevo/page.tsx    ✅ formulario GPS
└── api/
    ├── auth/                   ✅ NextAuth
    ├── registros/route.ts      ✅ CRUD ChromaDB
    └── metricas/route.ts       ✅ métricas del sistema

backend/ (Python corriendo en puerto 8000)
├── main.py                     ✅ FastAPI con /registros /buscar /metricas
├── chroma_client.py            ✅ ChromaDB conectado
└── seed_halconsat.py           ✅ 10 docs de conocimiento cargados
```

## Lo que crearemos hoy
```
src/app/
├── agente/
│   └── page.tsx                ← chat UI del dashboard
└── api/
    └── agente/
        └── route.ts            ← proxy Claude API + búsqueda semántica

backend/
└── main.py                     ← agregar endpoint POST /chat-log
```

## Variable de entorno requerida
```env
ANTHROPIC_API_KEY="sk-ant-..."   ← debe estar en .env.local
CHROMA_BACKEND_URL="http://localhost:8000"
```

## Colores de la marca
- Navy: `#1A3C5E` · Azul: `#2E86AB` · Verde-azul: `#17A398`

---

## TAREAS DE HOY — ejecutar en orden

---

### TAREA 1 · Agregar endpoint de log al backend Python

Abre `backend/main.py` y AGREGA al final del archivo (sin borrar nada):

```python
# ─── LOG DE CONVERSACIONES DEL AGENTE ───────────────────────────────────────

class ChatLog(BaseModel):
    usuario_email: str
    usuario_rol: str
    pregunta: str
    respuesta: str
    registros_usados: int
    latencia_ms: float

chat_logs: list = []   # En memoria (Día 3). En Día 4 se mueve a ChromaDB.

@app.post("/chat-log")
def guardar_log(log: ChatLog):
    entrada = {
        "id": f"log-{uuid.uuid4().hex[:8]}",
        "fecha_hora": datetime.utcnow().isoformat(),
        **log.dict()
    }
    chat_logs.append(entrada)
    return {"guardado": True, "total_logs": len(chat_logs)}

@app.get("/chat-log")
def obtener_logs(usuario_email: str = None, usuario_rol: str = "admin"):
    if usuario_rol == "admin":
        return {"logs": chat_logs, "total": len(chat_logs)}
    filtrados = [l for l in chat_logs if l.get("usuario_email") == usuario_email]
    return {"logs": filtrados, "total": len(filtrados)}

@app.get("/chat-log/metricas")
def metricas_chat():
    if not chat_logs:
        return {"total_consultas": 0, "latencia_promedio_ms": 0, "usuarios_unicos": 0}
    latencias = [l["latencia_ms"] for l in chat_logs]
    usuarios = set(l["usuario_email"] for l in chat_logs)
    return {
        "total_consultas": len(chat_logs),
        "latencia_promedio_ms": round(sum(latencias) / len(latencias), 2),
        "usuarios_unicos": len(usuarios),
        "ultima_consulta": chat_logs[-1]["fecha_hora"] if chat_logs else None
    }
```

Después de editar, **reinicia el backend**:
```bash
# Ctrl+C para parar uvicorn, luego:
uvicorn main:app --reload --port 8000
```

Verifica en `http://localhost:8000/docs` que aparecen los nuevos endpoints `/chat-log`.

---

### TAREA 2 · Crear `src/app/api/agente/route.ts`

Este es el corazón del Día 3. Recibe la pregunta, busca en ChromaDB, llama a Claude API.

```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const BACKEND = process.env.CHROMA_BACKEND_URL || "http://localhost:8000"
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const { pregunta, historial = [] } = await request.json()
  if (!pregunta?.trim()) {
    return NextResponse.json({ error: "Pregunta vacía" }, { status: 400 })
  }

  const usuarioEmail = session.user?.email || ""
  const usuarioRol   = (session.user as any)?.role || "cliente"
  const inicio       = Date.now()

  // ── PASO 1: Buscar registros semánticamente en ChromaDB ──────────────────
  let registrosEncontrados: any[] = []
  let latenciaBusqueda = 0

  try {
    const inicioBusqueda = Date.now()
    const resBusqueda = await fetch(`${BACKEND}/buscar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: pregunta,
        usuario_email: usuarioEmail,
        usuario_rol: usuarioRol,
        n_results: 5
      })
    })
    latenciaBusqueda = Date.now() - inicioBusqueda
    const dataBusqueda = await resBusqueda.json()
    registrosEncontrados = dataBusqueda.resultados || []
  } catch {
    // Si ChromaDB falla, el agente responde solo con su conocimiento base
    registrosEncontrados = []
  }

  // ── PASO 2: Construir contexto con los registros encontrados ─────────────
  const contextoRegistros = registrosEncontrados.length > 0
    ? registrosEncontrados.map((r: any, i: number) => `
Registro ${i + 1} (similitud: ${r.similitud}):
- Dispositivo: ${r.dispositivo_id || "N/A"} | Placa: ${r.placa || "N/A"}
- Tipo evento: ${r.tipo_evento || "N/A"}
- Descripción: ${r.descripcion || r.texto}
- Ubicación: ${r.ubicacion || "N/A"}
- Velocidad: ${r.velocidad || 0} km/h
- Estado: ${r.estado_dispositivo || "N/A"}
- Fecha: ${r.fecha_hora || "N/A"}
`.trim()).join("\n\n")
    : "No se encontraron registros GPS similares a la consulta."

  // ── PASO 3: Llamar a Claude API ──────────────────────────────────────────
  if (!ANTHROPIC_KEY) {
    return NextResponse.json({
      respuesta: "El agente no está configurado. Agrega ANTHROPIC_API_KEY al .env.local",
      registros_usados: 0,
      latencia_busqueda_ms: latenciaBusqueda,
      latencia_total_ms: Date.now() - inicio
    })
  }

  const esAdmin = usuarioRol === "admin"

  const systemPrompt = `Eres el asistente inteligente de HalconSat, sistema de seguridad vehicular GPS.
Respondes en español, de forma clara y concisa (máximo 4 oraciones).
Usuario actual: ${usuarioEmail} | Rol: ${usuarioRol.toUpperCase()}

${esAdmin
  ? "Como ADMIN puedes ver datos de todos los usuarios del sistema."
  : "Solo puedes responder sobre los registros GPS del usuario actual."
}

REGISTROS GPS ENCONTRADOS SEMÁNTICAMENTE RELACIONADOS CON LA PREGUNTA:
${contextoRegistros}

INSTRUCCIONES:
- Usa los registros anteriores como base para tu respuesta
- Si los registros contienen la información, úsala directamente con datos concretos
- Si no hay registros relevantes, dilo honestamente y sugiere registrar eventos
- Menciona placas, fechas y tipos de evento cuando sean relevantes
- No inventes datos que no estén en los registros`

  const messages = [
    ...historial.slice(-8).map((m: any) => ({
      role: m.role,
      content: m.content
    })),
    { role: "user", content: pregunta }
  ]

  try {
    const resClaude = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        system: systemPrompt,
        messages
      })
    })

    if (!resClA) throw new Error("Claude API error")
    const dataClA = await resClA.json()
    const respuesta = dataClA.content?.[0]?.text || "No pude procesar tu pregunta."
    const latenciaTotal = Date.now() - inicio

    // ── PASO 4: Guardar log de la conversación ─────────────────────────────
    fetch(`${BACKEND}/chat-log`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        usuario_email: usuarioEmail,
        usuario_rol: usuarioRol,
        pregunta,
        respuesta,
        registros_usados: registrosEncontrados.length,
        latencia_ms: latenciaTotal
      })
    }).catch(() => {}) // silencioso si falla el log

    return NextResponse.json({
      respuesta,
      registros_usados: registrosEncontrados.length,
      latencia_busqueda_ms: latenciaBusqueda,
      latencia_total_ms: latenciaTotal
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error al contactar Claude API", detalle: String(error) },
      { status: 500 }
    )
  }
}
```

> ⚠️ En la línea `if (!resClA)` hay un error de nombre de variable intencional para que lo notes.
> Corrige `resClA` por `resClA` → ambas referencias deben ser `resClA` o cambia el nombre a `resClAude`.
> El correcto es: `const resClAude = await fetch(...)` y `if (!resClAude.ok)` y `const dataClA = await resClAude.json()`

---

### TAREA 3 · Crear `src/app/agente/page.tsx`

```typescript
"use client"

import { useState, useRef, useEffect } from "react"
import { useSession } from "next-auth/react"
import { SessionProvider } from "next-auth/react"
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
```

---

### TAREA 4 · Verificar y hacer pruebas end-to-end

Con los dos servidores corriendo:

```bash
# Terminal 1
npm run dev

# Terminal 2
cd backend && uvicorn main:app --reload --port 8000
```

**Prueba estos 5 flujos en orden:**

1. Login como **cliente** → ir a "Agente IA" en el sidebar
2. Hacer clic en el botón rápido **"¿Cuántos registros GPS tengo?"**
   → el agente debe responder con el número real de tus registros
3. Escribir **"¿Tengo alertas de robo?"**
   → debe buscar en ChromaDB y mencionar el registro de alerta que insertaste ayer
4. Ver los badges debajo de la respuesta: `📋 X registros consultados · ⚡ XXXms`
5. Login como **admin** → preguntar **"¿Qué usuario tiene más registros?"**
   → debe ver datos de todos los usuarios

**Verificar que el log funciona:**
```bash
# En el navegador o terminal
curl http://localhost:8000/chat-log
```
Debe mostrar las conversaciones que acabas de hacer.

---

### TAREA 5 · Commit del Día 3

```bash
git add .
git commit -m "feat: Day3 - agente conversacional con Claude API + búsqueda semántica ChromaDB"
git push origin main
```

**Día 3 completado. ✅**
