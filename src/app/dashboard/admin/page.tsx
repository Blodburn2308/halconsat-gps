"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Metricas = {
  total_registros: number
  registros_por_usuario: Record<string, number>
  exitosos: number
  errores: number
  tasa_exito: number
  vectores_almacenados: number
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<Metricas | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (status === "loading") return
    if (!session || (session.user as any).role !== "admin") {
      router.replace("/login")
      return
    }

    fetch("/api/metricas", { cache: "no-store" })
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d as Metricas)
      })
      .catch(() => setError("No se pudieron cargar las métricas"))
      .finally(() => setCargando(false))
  }, [session, status, router])

  const usuariosActivos = data ? Object.keys(data.registros_por_usuario || {}).length : 0

  const metrics = [
    {
      label: "Total Registros GPS",
      value: cargando ? "…" : (data?.total_registros ?? 0).toString(),
      icon: "📍",
      color: "text-[#1A3C5E]",
    },
    {
      label: "Usuarios Activos",
      value: cargando ? "…" : usuariosActivos.toString(),
      icon: "👥",
      color: "text-[#2E86AB]",
    },
    {
      label: "Vectores Almacenados",
      value: cargando ? "…" : (data?.vectores_almacenados ?? 0).toString(),
      icon: "🧬",
      color: "text-purple-600",
    },
    {
      label: "Tasa de Éxito",
      value: cargando ? "…" : data ? `${data.tasa_exito}%` : "—",
      icon: "✅",
      color: "text-green-600",
    },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Dashboard General</h1>
          <p className="text-sm text-gray-500 mt-1">Vista completa del sistema Halconsat GPS</p>
        </div>
        <Badge className="bg-amber-100 text-amber-800 border border-amber-300">ADMINISTRADOR</Badge>
      </div>

      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="pt-6 text-sm text-red-700">
            ⚠️ {error} — verifica que el backend esté corriendo en http://localhost:8000
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map(m => (
          <Card key={m.label} className="shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{m.label}</p>
                  <p className={`text-3xl font-bold mt-1 ${m.color}`}>{m.value}</p>
                </div>
                <span className="text-2xl">{m.icon}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {data && Object.keys(data.registros_por_usuario || {}).length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-[#1A3C5E] mb-3">Registros por usuario</p>
            <div className="space-y-2">
              {Object.entries(data.registros_por_usuario).map(([email, count]) => (
                <div key={email} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700">{email}</span>
                  <Badge className="bg-[#2E86AB] text-white">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
