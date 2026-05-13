import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default async function ClienteDashboard() {
  const session = await auth()
  if (!session) redirect("/login")

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Mis Dispositivos GPS</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenido, {session.user?.name}</p>
        </div>
        <Badge className="bg-blue-100 text-[#1A3C5E] border border-[#2E86AB]">CLIENTE</Badge>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Mis Registros", value: "0", color: "text-[#1A3C5E]" },
          { label: "Consultas al Agente", value: "0", color: "text-[#2E86AB]" },
          { label: "Dispositivos Activos", value: "0", color: "text-green-600" },
        ].map(m => (
          <Card key={m.label}>
            <CardContent className="pt-6">
              <p className="text-xs text-gray-500">{m.label}</p>
              <p className={`text-3xl font-bold mt-1 ${m.color}`}>{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="pt-10 pb-10 text-center space-y-3">
          <span className="text-4xl">📍</span>
          <p className="text-gray-500 font-medium">No tienes registros GPS aún</p>
          <p className="text-sm text-gray-400">Mañana podrás registrar tus dispositivos desde aquí.</p>
          <Button className="bg-[#1A3C5E] text-white hover:bg-[#2E86AB]" disabled>
            + Nuevo Registro (disponible mañana)
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
