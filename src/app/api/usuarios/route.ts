import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const BACKEND = process.env.CHROMA_BACKEND_URL || "http://localhost:8000"

async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.email) {
    return { ok: false as const, response: NextResponse.json({ error: "No autorizado" }, { status: 401 }) }
  }
  if ((session.user as any).role !== "admin") {
    return { ok: false as const, response: NextResponse.json({ error: "Solo admin" }, { status: 403 }) }
  }
  return { ok: true as const }
}

export async function GET() {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  try {
    const res = await fetch(`${BACKEND}/usuarios`, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo contactar al backend", detalle: String(e) },
      { status: 502 }
    )
  }
}

export async function POST(request: NextRequest) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const body = await request.json()
  const payload = {
    nombre: body.nombre,
    email: body.email,
    password: body.password,
    placa: body.placa,
    dispositivo_id: body.dispositivo_id,
  }

  try {
    const res = await fetch(`${BACKEND}/usuarios`, {
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
