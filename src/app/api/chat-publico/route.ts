import { NextRequest, NextResponse } from "next/server"

const GROQ_KEY = process.env.GROQ_API_KEY
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const GROQ_MODEL = "llama-3.1-8b-instant"

export async function POST(request: NextRequest) {
  const { mensaje, historial = [] } = await request.json()

  if (!mensaje?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
  }

  if (!GROQ_KEY) {
    return NextResponse.json(
      { respuesta: "El agente no está disponible en este momento. Contáctanos al +593 96 967 2237." },
      { status: 200 }
    )
  }

  const systemPrompt = `Eres el asistente virtual de HalconSat, empresa ecuatoriana de seguridad vehicular GPS ubicada en Ibarra, Ecuador.

Tu personalidad: amigable, profesional, conciso. Responde SIEMPRE en español.
Usa máximo 3-4 oraciones por respuesta. Sin listas largas.

INFORMACIÓN DE HALCONSAT:
- Servicio: rastreo GPS en tiempo real, alertas de robo, control de geocercas, historial de rutas, control de velocidad, botón SOS
- Planes: Básico (rastreo + historial 30 días), Estándar (+ geocercas + alertas velocidad), Premium (+ SOS + monitoreo 24/7)
- Contacto: +593 96 967 2237 | info@halconsat.com | Ibarra, Ecuador
- El dispositivo se instala profesionalmente y envía posición cada 30 segundos en movimiento
- Compatible con cualquier vehículo: autos, camionetas, motos, flotas empresariales

Si preguntan por precios exactos, diles que ofrecemos cotización personalizada sin compromiso.
Si preguntan algo que no sabes, recomienda contactarlos al WhatsApp.
No inventes información.`

  const messages = [
    { role: "system", content: systemPrompt },
    ...historial.slice(-6).map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: mensaje },
  ]

  try {
    const resGroq = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: 400,
        messages,
      }),
    })

    if (!resGroq.ok) throw new Error(`Groq API error ${resGroq.status}`)
    const data = await resGroq.json()
    const respuesta =
      data.choices?.[0]?.message?.content || "No pude procesar tu pregunta. Intenta de nuevo."

    return NextResponse.json({ respuesta })
  } catch (error) {
    console.error("Error en chat público:", error)
    return NextResponse.json({
      respuesta: "Hubo un problema con el agente. Escríbenos al WhatsApp: +593 96 967 2237",
    })
  }
}
