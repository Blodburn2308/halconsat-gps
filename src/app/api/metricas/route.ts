import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"

const BACKEND = process.env.CHROMA_BACKEND_URL || "http://localhost:8000"

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const email = session.user?.email || ""
  const rol = (session.user as any)?.role || "cliente"

  try {
    const res = await fetch(
      `${BACKEND}/metricas/completas?usuario_email=${email}&usuario_rol=${rol}`,
      { cache: "no-store" }
    )
    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: "Backend no disponible" }, { status: 503 })
  }
}
