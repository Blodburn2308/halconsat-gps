"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

type Estado = "ok" | "error" | null

const TIPOS_EVENTO = [
  "Encendido",
  "Apagado",
  "Movimiento",
  "Geocerca-Salida",
  "Geocerca-Entrada",
  "Exceso-Velocidad",
  "Panico",
  "Sensor-Movimiento",
]

const ESTADOS_DISPOSITIVO = ["activo", "inactivo", "mantenimiento", "alerta"]

const INPUT_CLASS =
  "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"

export default function NuevoRegistroPage() {
  const [form, setForm] = useState({
    dispositivo_id: "",
    placa: "",
    tipo_evento: TIPOS_EVENTO[0],
    ubicacion: "",
    descripcion: "",
    estado_dispositivo: ESTADOS_DISPOSITIVO[0],
    velocidad: "0",
  })
  const [enviando, setEnviando] = useState(false)
  const [estado, setEstado] = useState<Estado>(null)
  const [latencia, setLatencia] = useState<number | null>(null)
  const [mensaje, setMensaje] = useState<string>("")

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setEstado(null)
    setLatencia(null)
    setMensaje("")

    try {
      const res = await fetch("/api/registros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setEstado("error")
        setMensaje(data?.error || data?.detail?.error || "Error al guardar el registro")
        return
      }

      setEstado("ok")
      setLatencia(data.latencia_ms ?? null)
      setMensaje(`Registro guardado · ID ${data.id}`)
      setForm(prev => ({
        ...prev,
        ubicacion: "",
        descripcion: "",
      }))
    } catch {
      setEstado("error")
      setMensaje("No se pudo enviar el formulario")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Nuevo Registro GPS</h1>
          <p className="text-sm text-gray-500 mt-1">
            Captura un evento de dispositivo y guárdalo en la base vectorial.
          </p>
        </div>
        <Link href="/dashboard/cliente" className="text-sm text-[#2E86AB] hover:underline">
          ← Volver
        </Link>
      </div>

      <Card className="shadow-sm">
        <CardContent className="pt-6">
          <form onSubmit={enviar} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dispositivo_id">Dispositivo ID</Label>
                <Input
                  id="dispositivo_id"
                  required
                  placeholder="GPS-001"
                  value={form.dispositivo_id}
                  onChange={set("dispositivo_id")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="placa">Placa</Label>
                <Input
                  id="placa"
                  required
                  placeholder="PCD-1234"
                  value={form.placa}
                  onChange={set("placa")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo_evento">Tipo de evento</Label>
                <select
                  id="tipo_evento"
                  className={INPUT_CLASS}
                  value={form.tipo_evento}
                  onChange={set("tipo_evento")}
                >
                  {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado_dispositivo">Estado del dispositivo</Label>
                <select
                  id="estado_dispositivo"
                  className={INPUT_CLASS}
                  value={form.estado_dispositivo}
                  onChange={set("estado_dispositivo")}
                >
                  {ESTADOS_DISPOSITIVO.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="ubicacion">Ubicación</Label>
                <Input
                  id="ubicacion"
                  required
                  placeholder="Av. Atahualpa y Cristóbal de Troya, Ibarra"
                  value={form.ubicacion}
                  onChange={set("ubicacion")}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Badge className="bg-[#2E86AB] text-white text-[10px]">
                    se convierte en vector
                  </Badge>
                </div>
                <textarea
                  id="descripcion"
                  required
                  rows={3}
                  className={INPUT_CLASS}
                  placeholder="Vehículo salió de la zona segura a las 14:32. Ruta hacia el norte."
                  value={form.descripcion}
                  onChange={set("descripcion")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="velocidad">Velocidad (km/h)</Label>
                <Input
                  id="velocidad"
                  type="number"
                  min={0}
                  step="0.1"
                  required
                  value={form.velocidad}
                  onChange={set("velocidad")}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pt-2">
              <Button
                type="submit"
                disabled={enviando}
                className="bg-[#1A3C5E] text-white hover:bg-[#2E86AB] disabled:opacity-60"
              >
                {enviando ? "Guardando…" : "Guardar registro"}
              </Button>

              {estado === "ok" && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-green-100 text-green-800 border border-green-300">
                    OK
                  </Badge>
                  <span className="text-gray-700">{mensaje}</span>
                  {latencia !== null && (
                    <Badge className="bg-[#1A3C5E] text-white">{latencia} ms</Badge>
                  )}
                </div>
              )}

              {estado === "error" && (
                <div className="flex items-center gap-2 text-sm">
                  <Badge className="bg-red-100 text-red-800 border border-red-300">
                    Error
                  </Badge>
                  <span className="text-gray-700">{mensaje}</span>
                </div>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
