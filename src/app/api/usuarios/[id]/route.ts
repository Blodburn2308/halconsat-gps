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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { id } = await params
  const body = await request.json()

  try {
    const res = await fetch(`${BACKEND}/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (!guard.ok) return guard.response

  const { id } = await params

  try {
    const res = await fetch(`${BACKEND}/usuarios/${id}`, { method: "DELETE" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (e) {
    return NextResponse.json(
      { error: "No se pudo contactar al backend", detalle: String(e) },
      { status: 502 }
    )
  }
}
