"use client"

import { useEffect, useState } from "react"
import { SessionProvider } from "next-auth/react"

// ─── Brand tokens ─────────────────────────────────────────────────────────
const BG       = "#080c14"
const SURFACE  = "#0d1321"
const CARD     = "#111827"
const CARD_2   = "#161f30"
const HAIRLINE = "rgba(255,255,255,0.06)"
const BORDER   = "rgba(255,255,255,0.08)"
const TEXT     = "#e8eaf0"
const TEXT_SOFT = "#b6bdcc"
const MUTED    = "#8892a4"
const ACCENT   = "#ff9a00"
const ACCENT_DIM = "#cc7b00"
const SUCCESS  = "#16a34a"
const DANGER   = "#e0392b"

const FONT_DISPLAY = "'Syne', system-ui, sans-serif"
const FONT_BODY    = "'DM Sans', system-ui, sans-serif"
const FONT_MONO    = "'JetBrains Mono', ui-monospace, monospace"

interface Usuario {
  id: string
  nombre: string
  email: string
  password?: string
  rol: string
  placa: string | null
  dispositivo_id: string | null
  activo: boolean
  fecha_creacion: string
}

interface FormData {
  nombre: string
  email: string
  password: string
  placa: string
  dispositivo_id: string
}

const FORM_VACIO: FormData = {
  nombre: "", email: "", password: "", placa: "", dispositivo_id: "",
}

function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [modalCrear, setModalCrear] = useState(false)
  const [form, setForm] = useState<FormData>(FORM_VACIO)
  const [enviando, setEnviando] = useState(false)

  const [editando, setEditando] = useState<Usuario | null>(null)
  const [formEdit, setFormEdit] = useState<{ nombre: string; placa: string; dispositivo_id: string }>({
    nombre: "", placa: "", dispositivo_id: "",
  })

  const [confirmandoEliminar, setConfirmandoEliminar] = useState<Usuario | null>(null)

  const cargar = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch("/api/usuarios", { cache: "no-store" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Error cargando usuarios")
      setUsuarios(data.usuarios || [])
    } catch (e: any) {
      setError(e?.message || "Error desconocido")
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => { cargar() }, [])

  const crear = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || data.error || "Error creando cuenta")
      setForm(FORM_VACIO)
      setModalCrear(false)
      await cargar()
    } catch (e: any) {
      setError(e?.message || "Error desconocido")
    } finally {
      setEnviando(false)
    }
  }

  const toggleActivo = async (u: Usuario) => {
    try {
      const res = await fetch(`/api/usuarios/${u.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activo: !u.activo }),
      })
      if (!res.ok) throw new Error("Error cambiando estado")
      await cargar()
    } catch (e: any) {
      setError(e?.message || "Error desconocido")
    }
  }

  const abrirEditar = (u: Usuario) => {
    setEditando(u)
    setFormEdit({
      nombre: u.nombre,
      placa: u.placa || "",
      dispositivo_id: u.dispositivo_id || "",
    })
  }

  const guardarEdicion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editando) return
    setEnviando(true)
    try {
      const res = await fetch(`/api/usuarios/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formEdit),
      })
      if (!res.ok) throw new Error("Error guardando")
      setEditando(null)
      await cargar()
    } catch (e: any) {
      setError(e?.message || "Error desconocido")
    } finally {
      setEnviando(false)
    }
  }

  const eliminar = async () => {
    if (!confirmandoEliminar) return
    try {
      const res = await fetch(`/api/usuarios/${confirmandoEliminar.id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Error eliminando")
      setConfirmandoEliminar(null)
      await cargar()
    } catch (e: any) {
      setError(e?.message || "Error desconocido")
    }
  }

  return (
    <div className="p-6 md:p-8" style={{ color: TEXT, fontFamily: FONT_BODY, minHeight: "100%" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div style={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: ACCENT }}>
            Administración
          </div>
          <h1 style={{ fontFamily: FONT_DISPLAY, fontSize: "1.7rem", fontWeight: 700, marginTop: 4 }}>
            Clientes
          </h1>
          <p style={{ color: MUTED, fontSize: "0.85rem", marginTop: 2 }}>
            Cuentas registradas en HalconSat — crea, edita o desactiva clientes y sus dispositivos GPS.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setModalCrear(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-[10px] transition-all"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
            color: "#0a0a0a",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 6px 20px rgba(255,154,0,0.25)",
          }}
        >
          <i className="fa-solid fa-user-plus" />
          Nuevo Cliente
        </button>
      </div>

      {/* Errores */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-[10px]" style={{
          background: "rgba(224,57,43,0.12)",
          border: `1px solid rgba(224,57,43,0.35)`,
          color: "#ffb4ad",
          fontSize: "0.85rem",
        }}>
          <i className="fa-solid fa-triangle-exclamation mr-2" />
          {error}
        </div>
      )}

      {/* Tabla */}
      <div style={{
        background: CARD, border: `1px solid ${HAIRLINE}`, borderRadius: 16,
        boxShadow: "0 8px 28px rgba(0,0,0,0.18)", overflow: "hidden",
      }}>
        <table className="w-full" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{
              background: SURFACE,
              borderBottom: `1px solid ${HAIRLINE}`,
              textAlign: "left",
              fontSize: "0.7rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: MUTED,
            }}>
              <th className="px-4 py-3 font-semibold">Nombre</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Placa</th>
              <th className="px-4 py-3 font-semibold">Dispositivo GPS</th>
              <th className="px-4 py-3 font-semibold">Estado</th>
              <th className="px-4 py-3 font-semibold">Fecha</th>
              <th className="px-4 py-3 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center" style={{ color: MUTED }}>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2" />
                  Cargando clientes…
                </td>
              </tr>
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center" style={{ color: MUTED }}>
                  <i className="fa-solid fa-users-slash mr-2" />
                  No hay clientes registrados. Crea el primero con el botón de arriba.
                </td>
              </tr>
            ) : usuarios.map((u, i) => (
              <tr key={u.id} style={{
                borderBottom: i === usuarios.length - 1 ? "none" : `1px solid ${HAIRLINE}`,
                fontSize: "0.85rem",
              }}>
                <td className="px-4 py-3" style={{ fontWeight: 600 }}>{u.nombre}</td>
                <td className="px-4 py-3" style={{ color: TEXT_SOFT, fontFamily: FONT_MONO, fontSize: "0.78rem" }}>{u.email}</td>
                <td className="px-4 py-3" style={{ fontFamily: FONT_MONO, fontSize: "0.78rem" }}>{u.placa || "—"}</td>
                <td className="px-4 py-3" style={{ fontFamily: FONT_MONO, fontSize: "0.78rem", color: TEXT_SOFT }}>{u.dispositivo_id || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleActivo(u)}
                    className="px-2.5 py-1 rounded-full transition-all"
                    style={{
                      background: u.activo ? "rgba(22,163,74,0.15)" : "rgba(224,57,43,0.15)",
                      color: u.activo ? "#4ade80" : "#ff8b80",
                      border: `1px solid ${u.activo ? "rgba(22,163,74,0.35)" : "rgba(224,57,43,0.35)"}`,
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      cursor: "pointer",
                    }}
                    title="Click para cambiar estado"
                  >
                    {u.activo ? "ACTIVO" : "INACTIVO"}
                  </button>
                </td>
                <td className="px-4 py-3" style={{ color: MUTED, fontFamily: FONT_MONO, fontSize: "0.75rem" }}>
                  {u.fecha_creacion?.slice(0, 10) || "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => abrirEditar(u)}
                      className="w-8 h-8 rounded-[8px] grid place-items-center transition-colors"
                      style={{ color: MUTED, border: `1px solid ${BORDER}` }}
                      title="Editar"
                      onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
                    >
                      <i className="fa-solid fa-pen text-xs" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoEliminar(u)}
                      className="w-8 h-8 rounded-[8px] grid place-items-center transition-colors"
                      style={{ color: MUTED, border: `1px solid ${BORDER}` }}
                      title="Eliminar"
                      onMouseEnter={(e) => { e.currentTarget.style.color = DANGER; e.currentTarget.style.borderColor = DANGER }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
                    >
                      <i className="fa-solid fa-trash text-xs" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: Nuevo Cliente */}
      {modalCrear && (
        <Modal onClose={() => setModalCrear(false)} titulo="Nuevo Cliente">
          <form onSubmit={crear} className="space-y-3">
            <Campo label="Nombre completo" value={form.nombre}
              onChange={v => setForm({ ...form, nombre: v })} required />
            <Campo label="Email" type="email" value={form.email}
              onChange={v => setForm({ ...form, email: v })} required />
            <Campo label="Contraseña temporal" type="text" value={form.password}
              onChange={v => setForm({ ...form, password: v })} required />
            <Campo label="Placa del vehículo" placeholder="ABC-1234" value={form.placa}
              onChange={v => setForm({ ...form, placa: v })} required />
            <Campo label="ID del dispositivo GPS" placeholder="GPS-HAL-00123" value={form.dispositivo_id}
              onChange={v => setForm({ ...form, dispositivo_id: v })} required />

            <button type="submit" disabled={enviando}
              className="w-full mt-4 px-4 py-3 rounded-[10px] transition-all"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
                color: "#0a0a0a", fontWeight: 700, fontSize: "0.88rem",
                boxShadow: "0 6px 20px rgba(255,154,0,0.25)",
                opacity: enviando ? 0.5 : 1, cursor: enviando ? "not-allowed" : "pointer",
              }}
            >
              {enviando ? "Creando…" : "Crear cuenta y asignar dispositivo"}
            </button>
          </form>
        </Modal>
      )}

      {/* Modal: Editar */}
      {editando && (
        <Modal onClose={() => setEditando(null)} titulo={`Editar ${editando.nombre}`}>
          <form onSubmit={guardarEdicion} className="space-y-3">
            <Campo label="Nombre completo" value={formEdit.nombre}
              onChange={v => setFormEdit({ ...formEdit, nombre: v })} required />
            <Campo label="Placa del vehículo" value={formEdit.placa}
              onChange={v => setFormEdit({ ...formEdit, placa: v })} />
            <Campo label="ID del dispositivo GPS" value={formEdit.dispositivo_id}
              onChange={v => setFormEdit({ ...formEdit, dispositivo_id: v })} />

            <button type="submit" disabled={enviando}
              className="w-full mt-4 px-4 py-3 rounded-[10px] transition-all"
              style={{
                background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
                color: "#0a0a0a", fontWeight: 700, fontSize: "0.88rem",
                boxShadow: "0 6px 20px rgba(255,154,0,0.25)",
                opacity: enviando ? 0.5 : 1, cursor: enviando ? "not-allowed" : "pointer",
              }}
            >
              {enviando ? "Guardando…" : "Guardar cambios"}
            </button>
          </form>
        </Modal>
      )}

      {/* Modal: Confirmar eliminar */}
      {confirmandoEliminar && (
        <Modal onClose={() => setConfirmandoEliminar(null)} titulo="Eliminar cliente">
          <p style={{ color: TEXT_SOFT, fontSize: "0.88rem", lineHeight: 1.5 }}>
            ¿Confirmas dar de baja a <strong style={{ color: TEXT }}>{confirmandoEliminar.nombre}</strong>?
            La cuenta se marcará como inactiva pero no se borra del sistema.
          </p>
          <div className="flex gap-2 mt-5">
            <button type="button" onClick={() => setConfirmandoEliminar(null)}
              className="flex-1 px-4 py-2.5 rounded-[10px]"
              style={{ background: CARD_2, color: TEXT_SOFT, border: `1px solid ${BORDER}`, fontWeight: 600, fontSize: "0.85rem" }}
            >
              Cancelar
            </button>
            <button type="button" onClick={eliminar}
              className="flex-1 px-4 py-2.5 rounded-[10px]"
              style={{ background: DANGER, color: "white", fontWeight: 700, fontSize: "0.85rem" }}
            >
              <i className="fa-solid fa-trash mr-2" />
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

// ─── Sub-componentes ─────────────────────────────────────────────────────

function Modal({ children, titulo, onClose }: {
  children: React.ReactNode
  titulo: string
  onClose: () => void
}) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 grid place-items-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md p-6 rounded-[16px]"
        style={{
          background: CARD,
          border: `1px solid ${HAIRLINE}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
          color: TEXT,
          fontFamily: FONT_BODY,
        }}
      >
        <div className="flex items-start justify-between mb-5">
          <h2 style={{ fontFamily: FONT_DISPLAY, fontWeight: 700, fontSize: "1.15rem" }}>
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] grid place-items-center"
            style={{ color: MUTED, border: `1px solid ${BORDER}` }}
          >
            <i className="fa-solid fa-xmark text-xs" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Campo({ label, value, onChange, type = "text", placeholder, required }: {
  label: string
  value: string
  onChange: (v: string) => void
  type?: string
  placeholder?: string
  required?: boolean
}) {
  return (
    <label className="block">
      <span style={{ fontSize: "0.72rem", color: MUTED, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full mt-1 px-3 py-2.5 rounded-[8px] outline-none transition-all"
        style={{
          background: SURFACE,
          border: `1px solid ${BORDER}`,
          color: TEXT,
          fontSize: "0.88rem",
          fontFamily: FONT_BODY,
        }}
        onFocus={e => { e.currentTarget.style.borderColor = ACCENT }}
        onBlur={e => { e.currentTarget.style.borderColor = BORDER }}
      />
    </label>
  )
}

export default function Page() {
  return (
    <SessionProvider>
      <GestionUsuarios />
    </SessionProvider>
  )
}
