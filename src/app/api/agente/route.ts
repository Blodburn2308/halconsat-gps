import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const BACKEND = process.env.CHROMA_BACKEND_URL || "http://localhost:8000"
const GROQ_KEY = process.env.GROQ_API_KEY
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.1-8b-instant"

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

  // ── PASO 3: Llamar a Groq API ────────────────────────────────────────────
  if (!GROQ_KEY) {
    return NextResponse.json({
      respuesta: "El agente no está configurado. Agrega GROQ_API_KEY al .env.local",
      registros_usados: 0,
      latencia_busqueda_ms: latenciaBusqueda,
      latencia_total_ms: Date.now() - inicio
    })
  }

  const esAdmin = usuarioRol === "admin"

  const systemPrompt = `LANGUAGE RULE (HIGHEST PRIORITY): Detect the language of the user's most recent message and ALWAYS reply in that exact same language. English in → English out. Spanish in → Spanish out. Portuguese in → Portuguese out. Any language in → same language out. Do NOT default to Spanish. Do NOT switch languages mid-conversation unless the user does.

Eres el asistente inteligente de HalconSat, sistema de seguridad vehicular GPS.
Responde de forma clara y concisa (máximo 4 oraciones).
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
- No inventes datos que no estén en los registros

FINAL REMINDER — LANGUAGE: Your reply MUST be in the same language as the user's last message. No exceptions, no defaults to Spanish.`

  const messages = [
    { role: "system", content: systemPrompt },
    ...historial.slice(-8).map((m: any) => ({
      role: m.role,
      content: m.content
    })),
    { role: "user", content: pregunta }
  ]

  try {
    const resGroq = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 500,
        messages
      })
    })

    if (!resGroq.ok) throw new Error(`Groq API error ${resGroq.status}`)
    const dataGroq = await resGroq.json()
    const respuesta = dataGroq.choices?.[0]?.message?.content || "Sin respuesta"
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
    }).catch(() => {})

    return NextResponse.json({
      respuesta,
      registros_usados: registrosEncontrados.length,
      latencia_busqueda_ms: latenciaBusqueda,
      latencia_total_ms: latenciaTotal
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Error al contactar Groq API", detalle: String(error) },
      { status: 500 }
    )
  }
}
