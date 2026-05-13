"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const result = await signIn("credentials", { email, password, redirect: false })
    if (result?.error) {
      setError("Credenciales incorrectas.")
      setLoading(false)
      return
    }
    const res = await fetch("/api/auth/session")
    const session = await res.json()
    router.push(session?.user?.role === "admin" ? "/dashboard/admin" : "/dashboard/cliente")
  }

  const fill = (type: "admin" | "cliente") => {
    setEmail(type === "admin" ? "admin@halconsat.com" : "cliente@halconsat.com")
    setPassword(type === "admin" ? "admin123" : "cliente123")
  }

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-[#1A3C5E] rounded-full flex items-center justify-center">
              <span className="text-white text-2xl">🛰️</span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Halconsat</h1>
          <p className="text-sm text-gray-500">Monitoreo vehicular inteligente</p>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-[#1A3C5E]">Iniciar Sesión</CardTitle>
            <CardDescription>Ingresa tus credenciales para acceder</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@halconsat.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Contraseña</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</p>}
              <Button type="submit" className="w-full bg-[#1A3C5E] hover:bg-[#2E86AB] text-white" disabled={loading}>
                {loading ? "Verificando..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 border-dashed">
          <CardContent className="pt-4">
            <p className="text-xs text-gray-500 text-center mb-3 font-medium">DEMO — clic para rellenar</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => fill("admin")} className="text-left p-2 rounded bg-white border hover:border-[#1A3C5E] transition-colors">
                <Badge className="bg-[#1A3C5E] text-white text-xs mb-1">ADMIN</Badge>
                <p className="text-xs text-gray-600">admin@halconsat.com</p>
                <p className="text-xs text-gray-400">admin123</p>
              </button>
              <button type="button" onClick={() => fill("cliente")} className="text-left p-2 rounded bg-white border hover:border-[#2E86AB] transition-colors">
                <Badge className="bg-[#2E86AB] text-white text-xs mb-1">CLIENTE</Badge>
                <p className="text-xs text-gray-600">cliente@halconsat.com</p>
                <p className="text-xs text-gray-400">cliente123</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
