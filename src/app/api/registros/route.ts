import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8000"

export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const body = await request.json()
  const role = (session.user as any).role ?? "cliente"

  const payload = {
    dispositivo_id: body.dispositivo_id,
    placa: body.placa,
    tipo_evento: body.tipo_evento,
    ubicacion: body.ubicacion,
    descripcion: body.descripcion,
    estado_dispositivo: body.estado_dispositivo,
    velocidad: Number(body.velocidad ?? 0),
    usuario_email: session.user.email,
    usuario_rol: role,
  }

  try {
    const res = await fetch(`${BACKEND}/registros`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo contactar al backend", detalle: String(e) },
      { status: 502 }
    )
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })
  }

  const role = (session.user as any).role ?? "cliente"
  const url = new URL(`${BACKEND}/registros`)
  url.searchParams.set("usuario_email", session.user.email)
  url.searchParams.set("usuario_rol", role)

  try {
    const res = await fetch(url.toString(), { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo contactar al backend", detalle: String(e) },
      { status: 502 }
    )
  }
}
