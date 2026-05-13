import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function AdminDashboard() {
  const session = await auth()
  if (!session || (session.user as any).role !== "admin") redirect("/login")

  const metrics = [
    { label: "Total Registros GPS", value: "0", icon: "📍", color: "text-[#1A3C5E]" },
    { label: "Usuarios Activos", value: "2", icon: "👥", color: "text-[#2E86AB]" },
    { label: "Consultas al Agente", value: "0", icon: "🤖", color: "text-purple-600" },
    { label: "Tasa de Éxito", value: "—", icon: "✅", color: "text-green-600" },
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

      <Card className="border-dashed border-[#2E86AB] bg-blue-50">
        <CardContent className="pt-6 text-center">
          <p className="text-[#2E86AB] font-medium">🚀 Día 1 completado — Sistema base operativo</p>
          <p className="text-sm text-gray-500 mt-1">Mañana se conectará ChromaDB y los registros GPS aparecerán aquí.</p>
        </CardContent>
      </Card>
    </div>
  )
}
