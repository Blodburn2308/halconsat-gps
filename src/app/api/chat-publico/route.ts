import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const { mensaje, historial = [] } = await request.json()

  if (!mensaje?.trim()) {
    return NextResponse.json({ error: "Mensaje vacío" }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { respuesta: "El agente no está disponible en este momento. Contáctanos al +593 999 999 999." },
      { status: 200 }
    )
  }

  try {
    const messages = [
      ...historial.slice(-6),
      { role: "user", content: mensaje }
    ]

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: `Eres el asistente virtual de HalconSat, empresa ecuatoriana de seguridad vehicular GPS ubicada en Ibarra, Ecuador.

Tu personalidad: amigable, profesional, conciso. Responde SIEMPRE en español.
Usa máximo 3-4 oraciones por respuesta. Sin listas largas.

INFORMACIÓN DE HALCONSAT:
- Servicio: rastreo GPS en tiempo real, alertas de robo, control de geocercas, historial de rutas, control de velocidad, botón SOS
- Planes: Básico (rastreo + historial 30 días), Estándar (+ geocercas + alertas velocidad), Premium (+ SOS + monitoreo 24/7)
- Contacto: +593 999 999 999 | info@halconsat.com | Ibarra, Ecuador
- El dispositivo se instala profesionalmente y envía posición cada 30 segundos en movimiento
- Compatible con cualquier vehículo: autos, camionetas, motos, flotas empresariales

Si preguntan por precios exactos, diles que ofrecemos cotización personalizada sin compromiso.
Si preguntan algo que no sabes, recomienda contactarlos al WhatsApp.
No inventes información.`,
        messages,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    const respuesta = data.content[0]?.text || "No pude procesar tu pregunta. Intenta de nuevo."

    return NextResponse.json({ respuesta })
  } catch (error) {
    console.error("Error en chat público:", error)
    return NextResponse.json({
      respuesta: "Hubo un problema con el agente. Escríbenos al WhatsApp: +593 999 999 999"
    })
  }
}
