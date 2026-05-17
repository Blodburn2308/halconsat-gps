"use client"

import { useEffect, useMemo, useState } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import Link from "next/link"

interface Registro {
  id: string
  dispositivo_id?: string
  placa?: string
  tipo_evento?: string
  ubicacion?: string
  descripcion?: string
  estado_dispositivo?: string
  velocidad?: number
  usuario_email?: string
  usuario_rol?: string
  fecha_hora?: string
  latencia_ms?: number
  exitoso?: boolean
}

const NAVY = "#1A3C5E"
const AZUL = "#2E86AB"

function badgeEstado(estado?: string) {
  const base = "text-xs px-2 py-1 rounded-full font-medium"
  if (!estado) return `${base} bg-gray-100 text-gray-600`
  const e = estado.toLowerCase()
  if (e === "activo") return `${base} bg-green-100 text-green-700`
  if (e === "alerta" || e === "sin señal") return `${base} bg-red-100 text-red-700`
  if (e === "mantenimiento") return `${base} bg-amber-100 text-amber-800`
  return `${base} bg-gray-100 text-gray-600`
}

function badgeEvento(evento?: string) {
  const base = "text-xs px-2 py-1 rounded-full font-medium"
  if (!evento) return `${base} bg-gray-100 text-gray-600`
  const e = evento.toLowerCase()
  if (e.includes("robo") || e.includes("panico") || e.includes("sos")) return `${base} bg-red-100 text-red-700`
  if (e.includes("geocerca")) return `${base} bg-blue-100 text-blue-700`
  if (e.includes("exceso")) return `${base} bg-amber-100 text-amber-800`
  return `${base} bg-gray-100 text-gray-700`
}

function ClienteRegistrosContent() {
  const { data: session } = useSession()
  const email = session?.user?.email || ""

  const [registros, setRegistros] = useState<Registro[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filtroEvento, setFiltroEvento] = useState<string>("todos")

  useEffect(() => {
    fetch("/api/registros", { cache: "no-store" })
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error)
        else {
          // El backend ya filtra por usuario cuando rol=cliente, pero filtramos de
          // nuevo en cliente para defensa en profundidad.
          const propios = (data.registros || []).filter(
            (r: Registro) => !email || r.usuario_email === email
          )
          setRegistros(propios)
        }
      })
      .catch(() => setError("No se pudieron cargar tus registros"))
      .finally(() => setCargando(false))
  }, [email])

  const tipos = useMemo(() => {
    const set = new Set<string>()
    registros.forEach(r => { if (r.tipo_evento) set.add(r.tipo_evento) })
    return Array.from(set).sort()
  }, [registros])

  const filtrados = filtroEvento === "todos"
    ? registros
    : registros.filter(r => r.tipo_evento === filtroEvento)

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: NAVY }}>Mis Registros GPS</h1>
          <p className="text-sm text-gray-500 mt-1">
            {cargando ? "cargando…" : `${filtrados.length} de ${registros.length}`} registros · {email || "sesión"}
          </p>
        </div>
        <Link
          href="/registros/nuevo"
          className="bg-[#1A3C5E] hover:bg-[#2E86AB] text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          + Nuevo Registro
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl border shadow-sm p-4 flex flex-wrap items-center gap-3">
        <label htmlFor="filtro-evento" className="text-sm font-medium text-gray-700">
          Filtrar por tipo de evento:
        </label>
        <select
          id="filtro-evento"
          value={filtroEvento}
          onChange={e => setFiltroEvento(e.target.value)}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900
                     focus:outline-none focus:ring-2 focus:ring-[#2E86AB] focus:border-transparent"
        >
          <option value="todos">Todos ({registros.length})</option>
          {tipos.map(t => (
            <option key={t} value={t}>
              {t} ({registros.filter(r => r.tipo_evento === t).length})
            </option>
          ))}
        </select>
        {filtroEvento !== "todos" && (
          <button
            onClick={() => setFiltroEvento("todos")}
            className="text-xs text-[#2E86AB] hover:underline"
          >
            limpiar filtro
          </button>
        )}
      </div>

      {/* Estados de carga / error */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
          <p className="text-orange-700 font-semibold">⚠️ {error}</p>
          <p className="text-gray-500 text-sm mt-2">
            Verifica que el backend Python esté corriendo en http://localhost:8000
          </p>
        </div>
      )}

      {!error && cargando && (
        <div className="flex items-center justify-center h-48">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-4 border-[#2E86AB] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-gray-500 text-sm">Cargando registros…</p>
          </div>
        </div>
      )}

      {!error && !cargando && filtrados.length === 0 && (
        <div className="bg-white rounded-xl border shadow-sm p-10 text-center space-y-3">
          <span className="text-4xl">📭</span>
          <p className="text-gray-500 font-medium">
            {registros.length === 0 ? "Aún no tienes registros GPS" : "Sin resultados para este filtro"}
          </p>
          {registros.length === 0 && (
            <Link
              href="/registros/nuevo"
              className="inline-block bg-[#1A3C5E] text-white text-sm px-4 py-2 rounded-lg hover:bg-[#2E86AB] transition-colors"
            >
              Registrar mi primer evento GPS
            </Link>
          )}
        </div>
      )}

      {/* Tabla */}
      {!error && !cargando && filtrados.length > 0 && (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead style={{ background: NAVY }} className="text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Dispositivo</th>
                  <th className="text-left px-4 py-3 font-semibold">Placa</th>
                  <th className="text-left px-4 py-3 font-semibold">Tipo Evento</th>
                  <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                  <th className="text-left px-4 py-3 font-semibold">Fecha</th>
                  <th className="text-right px-4 py-3 font-semibold">Latencia ms</th>
                  <th className="text-left px-4 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{r.id}</td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-700">{r.dispositivo_id || "—"}</td>
                    <td className="px-4 py-3 font-bold" style={{ color: NAVY }}>{r.placa || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={badgeEvento(r.tipo_evento)}>{r.tipo_evento || "—"}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{r.usuario_email || "—"}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {r.fecha_hora ? new Date(r.fecha_hora).toLocaleString("es-EC") : "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-xs" style={{ color: AZUL }}>
                      {r.latencia_ms != null ? r.latencia_ms.toFixed(1) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={badgeEstado(r.estado_dispositivo)}>
                        {r.estado_dispositivo || "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ClienteRegistrosPage() {
  return (
    <SessionProvider>
      <ClienteRegistrosContent />
    </SessionProvider>
  )
}
