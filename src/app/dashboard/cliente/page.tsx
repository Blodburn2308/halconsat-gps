"use client"

import { useEffect, useState } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import Link from "next/link"

function ClienteContent() {
  const { data: session } = useSession()
  const [m, setM] = useState<any>(null)
  const [registros, setRegistros] = useState<any[]>([])

  useEffect(() => {
    fetch("/api/metricas").then(r => r.json()).then(setM).catch(() => {})
    fetch("/api/registros").then(r => r.json()).then(d => setRegistros(d.registros || [])).catch(() => {})
  }, [])

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Mis Dispositivos GPS</h1>
          <p className="text-sm text-gray-500 mt-1">Bienvenido, {session?.user?.name}</p>
        </div>
        <Link
          href="/registros/nuevo"
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white text-sm font-medium
                     px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo Registro
        </Link>
      </div>

      {/* Métricas del cliente */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Mis Registros", value: m?.total_registros ?? "—", icon: "📍", color: "#1A3C5E" },
          { label: "Consultas al Agente", value: m?.consultas_agente ?? "—", icon: "🤖", color: "#7C3AED" },
          { label: "Tasa de Éxito", value: m ? `${m.tasa_exito}%` : "—", icon: "✅", color: "#2D9E5A" },
        ].map(card => (
          <div key={card.label} className="bg-white rounded-xl border shadow-sm p-5">
            <div className="flex items-start justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{card.label}</p>
              <span className="text-xl">{card.icon}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Mis últimos registros */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          Mis últimos registros GPS
        </h2>
        {registros.length === 0 ? (
          <div className="bg-white rounded-xl border shadow-sm p-10 text-center space-y-3">
            <span className="text-4xl">📍</span>
            <p className="text-gray-500 font-medium">No tienes registros GPS aún</p>
            <Link
              href="/registros/nuevo"
              className="inline-block bg-[#1A3C5E] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E86AB] transition-colors"
            >
              Registrar mi primer evento GPS
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1A3C5E] text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Dispositivo</th>
                  <th className="text-left px-4 py-3 font-semibold">Placa</th>
                  <th className="text-left px-4 py-3 font-semibold">Evento</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                  <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {registros.slice(0, 8).map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">{r.dispositivo_id}</td>
                    <td className="px-4 py-3 font-bold text-[#1A3C5E]">{r.placa}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        r.tipo_evento?.includes("robo") || r.tipo_evento?.includes("SOS")
                          ? "bg-red-100 text-red-700"
                          : r.tipo_evento?.includes("Geo")
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {r.tipo_evento}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        r.estado_dispositivo === "Activo"
                          ? "bg-green-100 text-green-700"
                          : r.estado_dispositivo === "Sin señal"
                          ? "bg-orange-100 text-orange-700"
                          : "bg-gray-100 text-gray-600"
                      }`}>
                        {r.estado_dispositivo}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.fecha_hora ? new Date(r.fecha_hora).toLocaleString("es-EC") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ClienteDashboard() {
  return (
    <SessionProvider>
      <ClienteContent />
    </SessionProvider>
  )
}
