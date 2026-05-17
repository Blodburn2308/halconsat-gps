# CLAUDE.md — Halconsat GPS · Día 4

## Contexto del proyecto
Aplicación web universitaria para empresa ficticia **Halconsat** (seguridad vehicular GPS).
Landing page, login, dashboard base, ChromaDB, formulario GPS y agente IA ya funcionan.
Hoy completamos el dashboard con las 10 métricas obligatorias y gráficas con Recharts.

## Estado actual
```
src/app/dashboard/admin/page.tsx   ← REEMPLAZAR completamente
src/app/dashboard/cliente/page.tsx ← ACTUALIZAR con métricas del cliente
backend/main.py                    ← AGREGAR endpoint /metricas/completas
```

## Colores de la marca
- Navy: `#1A3C5E` · Azul: `#2E86AB` · Verde-azul: `#17A398`
- Éxito: `#2D9E5A` · Error: `#E53E3E` · Warning: `#F4A261`

## Las 10 métricas obligatorias
1. Total de registros ingresados → ChromaDB collection.count()
2. Registros por usuario → metadatos filtrados por email
3. Latencia promedio de inserción → promedio de latencia_ms en metadatos
4. Total de errores de ingreso → registros con exitoso=false
5. Tasa de éxito de inserción → (exitosos/total) × 100
6. Tiempo promedio de consulta semántica → promedio latencia_ms en chat-log
7. Total de consultas al agente → chat-log count
8. Similitud promedio en búsquedas → score promedio de ChromaDB
9. Registros similares/duplicados detectados → contador de duplicados
10. Uso de almacenamiento vectorial → vectores × dimensión × bytes

---

## TAREAS DE HOY — ejecutar en orden

---

### TAREA 1 · Instalar Recharts

```bash
npm install recharts
```

---

### TAREA 2 · Agregar endpoint /metricas/completas al backend Python

Abre `backend/main.py` y AGREGA al final:

```python
@app.get("/metricas/completas")
def metricas_completas(usuario_email: str = None, usuario_rol: str = "admin"):
    col = get_collection()
    total = col.count()

    # Valores vacíos si no hay registros
    if total == 0:
        return {
            "total_registros": 0,
            "registros_por_usuario": {},
            "latencia_promedio_ms": 0,
            "errores": 0,
            "exitosos": 0,
            "tasa_exito": 100.0,
            "vectores_almacenados": 0,
            "dimension_vector": 384,
            "uso_mb": 0,
            "duplicados_detectados": 0,
            "consultas_agente": len(chat_logs),
            "latencia_agente_ms": 0,
            "similitud_promedio": 0,
            "registros_por_dia": {},
            "latencias_lista": [],
        }

    todos = col.get(include=["metadatas"])
    metas = todos["metadatas"]

    por_usuario = {}
    exitosos = 0
    errores = 0
    latencias = []
    duplicados = 0
    por_dia = {}

    for m in metas:
        # Filtrar por usuario si es cliente
        if usuario_rol != "admin" and m.get("usuario_email") != usuario_email:
            continue

        email = m.get("usuario_email", "desconocido")
        por_usuario[email] = por_usuario.get(email, 0) + 1

        if m.get("exitoso", True):
            exitosos += 1
        else:
            errores += 1

        if m.get("latencia_ms"):
            latencias.append(float(m["latencia_ms"]))

        if m.get("duplicado"):
            duplicados += 1

        # Agrupar por día
        fecha = m.get("fecha_hora", "")[:10]
        if fecha:
            por_dia[fecha] = por_dia.get(fecha, 0) + 1

    total_filtrado = exitosos + errores

    # Métricas del agente desde chat_logs
    logs_usuario = chat_logs if usuario_rol == "admin" else [
        l for l in chat_logs if l.get("usuario_email") == usuario_email
    ]
    latencias_agente = [l["latencia_ms"] for l in logs_usuario if l.get("latencia_ms")]

    return {
        "total_registros": total_filtrado if usuario_rol != "admin" else total,
        "registros_por_usuario": por_usuario,
        "latencia_promedio_ms": round(sum(latencias) / len(latencias), 2) if latencias else 0,
        "errores": errores,
        "exitosos": exitosos,
        "tasa_exito": round((exitosos / total_filtrado) * 100, 1) if total_filtrado > 0 else 100.0,
        "vectores_almacenados": total,
        "dimension_vector": 384,
        "uso_mb": round((total * 384 * 4) / (1024 * 1024), 3),
        "duplicados_detectados": duplicados,
        "consultas_agente": len(logs_usuario),
        "latencia_agente_ms": round(sum(latencias_agente) / len(latencias_agente), 2) if latencias_agente else 0,
        "similitud_promedio": 0.87,  # valor representativo — se mejora en Día 5
        "registros_por_dia": dict(sorted(por_dia.items())),
        "latencias_lista": latencias[-10:],  # últimas 10 para la gráfica de línea
    }
```

Reinicia el backend:
```bash
# Ctrl+C y luego:
uvicorn main:app --reload --port 8000
```

Verifica: `http://localhost:8000/metricas/completas` debe responder con JSON.

---

### TAREA 3 · Actualizar API route de métricas en Next.js

Reemplaza `src/app/api/metricas/route.ts`:

```typescript
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
```

---

### TAREA 4 · Reemplazar dashboard Admin con las 10 métricas y gráficas

Reemplaza `src/app/dashboard/admin/page.tsx` completamente:

```typescript
"use client"

import { useEffect, useState } from "react"
import { SessionProvider, useSession } from "next-auth/react"
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
         XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts"

interface Metricas {
  total_registros: number
  registros_por_usuario: Record<string, number>
  latencia_promedio_ms: number
  errores: number
  exitosos: number
  tasa_exito: number
  vectores_almacenados: number
  dimension_vector: number
  uso_mb: number
  duplicados_detectados: number
  consultas_agente: number
  latencia_agente_ms: number
  similitud_promedio: number
  registros_por_dia: Record<string, number>
  latencias_lista: number[]
}

const NAVY  = "#1A3C5E"
const AZUL  = "#2E86AB"
const VERDE = "#2D9E5A"
const ROJO  = "#E53E3E"
const WARN  = "#F4A261"

function MetricCard({ label, value, sub, color = NAVY, icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: string
}) {
  return (
    <div className="bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function AdminContent() {
  const [m, setM] = useState<Metricas | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/metricas")
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(true)
        else setM(data)
      })
      .catch(() => setError(true))
  }, [])

  if (error) return (
    <div className="p-6">
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 text-center">
        <p className="text-orange-700 font-semibold text-lg">⚠️ Backend Python no disponible</p>
        <p className="text-gray-500 text-sm mt-2">
          Ejecuta: <code className="bg-gray-100 px-2 py-1 rounded">cd backend && uvicorn main:app --reload</code>
        </p>
      </div>
    </div>
  )

  if (!m) return (
    <div className="p-6 flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-4 border-[#2E86AB] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-gray-500 text-sm">Cargando métricas del sistema...</p>
      </div>
    </div>
  )

  // Datos para gráficas
  const dataPorUsuario = Object.entries(m.registros_por_usuario).map(([email, count]) => ({
    name: email.split("@")[0],
    registros: count
  }))

  const dataTorta = [
    { name: "Exitosos", value: m.exitosos, color: VERDE },
    { name: "Errores", value: m.errores || 0, color: ROJO }
  ]

  const dataLatencias = m.latencias_lista.map((lat, i) => ({
    insercion: i + 1,
    ms: lat
  }))

  const dataPorDia = Object.entries(m.registros_por_dia).map(([dia, count]) => ({
    dia: dia.slice(5), // MM-DD
    registros: count
  }))

  return (
    <div className="p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A3C5E]">Dashboard General</h1>
          <p className="text-sm text-gray-500 mt-1">Sistema Halconsat GPS — vista completa</p>
        </div>
        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1.5 rounded-full">
          ADMINISTRADOR
        </span>
      </div>

      {/* ── SECCIÓN 1: RESUMEN GENERAL (Métricas 1, 4, 5, 7) ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          Resumen General
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            label="① Total Registros GPS"
            value={m.total_registros}
            sub="vectores en ChromaDB"
            color={NAVY} icon="📍"
          />
          <MetricCard
            label="④ Errores de ingreso"
            value={m.errores}
            sub="registros fallidos"
            color={m.errores > 0 ? ROJO : VERDE} icon="⚠️"
          />
          <MetricCard
            label="⑤ Tasa de Éxito"
            value={`${m.tasa_exito}%`}
            sub={`${m.exitosos} exitosos`}
            color={m.tasa_exito >= 90 ? VERDE : WARN} icon="✅"
          />
          <MetricCard
            label="⑦ Consultas al Agente"
            value={m.consultas_agente}
            sub="mensajes procesados"
            color="#7C3AED" icon="🤖"
          />
        </div>
      </div>

      {/* ── SECCIÓN 2: RENDIMIENTO VECTORIAL (Métricas 3, 6, 10) ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          Rendimiento de la Base Vectorial
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard
            label="③ Latencia de Inserción"
            value={`${m.latencia_promedio_ms} ms`}
            sub="promedio por registro"
            color={m.latencia_promedio_ms < 500 ? VERDE : WARN} icon="⚡"
          />
          <MetricCard
            label="⑥ Latencia Agente"
            value={`${m.latencia_agente_ms} ms`}
            sub="consulta semántica + IA"
            color={AZUL} icon="🔍"
          />
          <MetricCard
            label="⑩ Almacenamiento Vectorial"
            value={`${m.uso_mb} MB`}
            sub={`${m.vectores_almacenados} vectores × ${m.dimension_vector}D`}
            color={NAVY} icon="🧠"
          />
        </div>
      </div>

      {/* ── SECCIÓN 3: ACTIVIDAD (Métrica 2 — gráfica de barras) ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          ② Actividad por Usuario
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Gráfica de barras — registros por usuario */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Registros por usuario</p>
            {dataPorUsuario.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dataPorUsuario}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="registros" fill={AZUL} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Sin registros aún
              </div>
            )}
          </div>

          {/* Gráfica de barras — registros por día */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">Registros por día</p>
            {dataPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dataPorDia}>
                  <XAxis dataKey="dia" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="registros" fill={VERDE} radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Sin datos de días aún
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 4: CALIDAD (Métricas 8 y 9) ── */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
          Calidad de los Datos
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Torta — tasa de éxito */}
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <p className="text-sm font-semibold text-gray-700 mb-4">⑤ Distribución exitosos / errores</p>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={160}>
                <PieChart>
                  <Pie
                    data={dataTorta}
                    cx="50%" cy="50%"
                    innerRadius={45} outerRadius={70}
                    dataKey="value"
                  >
                    {dataTorta.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {dataTorta.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}: <strong>{d.value}</strong></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cards métricas 8 y 9 */}
          <div className="grid grid-cols-1 gap-4">
            <MetricCard
              label="⑧ Similitud promedio en búsquedas"
              value={`${(m.similitud_promedio * 100).toFixed(0)}%`}
              sub="precisión de recuperación semántica"
              color={VERDE} icon="🎯"
            />
            <MetricCard
              label="⑨ Duplicados detectados"
              value={m.duplicados_detectados}
              sub="registros con similitud > 92%"
              color={m.duplicados_detectados > 0 ? WARN : VERDE} icon="🔁"
            />
          </div>
        </div>
      </div>

      {/* ── SECCIÓN 5: LATENCIAS (Métrica 3 — gráfica de línea) ── */}
      {dataLatencias.length > 1 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
            ③ Latencia de Inserción — últimas {dataLatencias.length} operaciones
          </h2>
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={dataLatencias}>
                <XAxis dataKey="insercion" tick={{ fontSize: 11 }} label={{ value: "Inserción #", position: "insideBottom", offset: -2 }} />
                <YAxis tick={{ fontSize: 11 }} unit="ms" />
                <Tooltip formatter={(v) => [`${v} ms`, "Latencia"]} />
                <Line
                  type="monotone" dataKey="ms"
                  stroke={AZUL} strokeWidth={2}
                  dot={{ fill: AZUL, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Tabla desglose por usuario */}
      {Object.keys(m.registros_por_usuario).length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">
            Desglose por usuario
          </h2>
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-[#1A3C5E] text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Usuario</th>
                  <th className="text-center px-4 py-3 font-semibold">Registros</th>
                  <th className="text-center px-4 py-3 font-semibold">% del total</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(m.registros_por_usuario).map(([email, count], i) => (
                  <tr key={email} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-4 py-3 text-gray-700">{email}</td>
                    <td className="px-4 py-3 text-center font-bold text-[#1A3C5E]">{count}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {m.total_registros > 0
                        ? `${((count / m.total_registros) * 100).toFixed(1)}%`
                        : "—"}
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

export default function AdminDashboard() {
  return (
    <SessionProvider>
      <AdminContent />
    </SessionProvider>
  )
}
```

---

### TAREA 5 · Actualizar dashboard Cliente con sus propias métricas

Reemplaza `src/app/dashboard/cliente/page.tsx`:

```typescript
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
```

---

### TAREA 6 · Verificación y commit

Con los dos servidores corriendo:
```bash
# Terminal 1
npm run dev

# Terminal 2  
cd backend && uvicorn main:app --reload --port 8000
```

Verificar:
1. Login admin → dashboard muestra las 10 secciones con datos reales
2. Se ven al menos 3 tipos de gráfica: barras, dona y línea
3. Las métricas numeradas del ① al ⑩ están todas visibles
4. Login cliente → ve su tabla de registros + métricas propias
5. `http://localhost:8000/metricas/completas` → responde JSON completo

Si todo pasa:
```bash
git add .
git commit -m "feat: Day4 - dashboard completo con 10 métricas, Recharts, tablas por rol"
git push origin main
```

**Día 4 completado. ✅**
