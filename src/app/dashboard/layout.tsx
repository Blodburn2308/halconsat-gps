"use client"

import { useSession, signOut, SessionProvider } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"

// ─── Brand tokens (Halconsat — diseño 2026) ───────────────────────────────
const BG          = "#080c14"
const SURFACE     = "#0d1321"
const CARD_2      = "#161f30"
const HAIRLINE    = "rgba(255,255,255,0.06)"
const BORDER      = "rgba(255,255,255,0.08)"
const TEXT        = "#e8eaf0"
const TEXT_SOFT   = "#b6bdcc"
const MUTED       = "#8892a4"
const ACCENT      = "#ff9a00"
const ACCENT_DIM  = "#cc7b00"

const FONT_DISPLAY = "'Syne', system-ui, sans-serif"
const FONT_BODY    = "'DM Sans', system-ui, sans-serif"
const FONT_MONO    = "'JetBrains Mono', ui-monospace, monospace"

function BrandHead() {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
      />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />
    </>
  )
}

interface LinkItem {
  href: string
  label: string
  icon: string         // Font Awesome class, e.g. "fa-house"
  section?: string
  badge?: number | string
}

function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = (session?.user as any)?.role

  const links: LinkItem[] = role === "admin"
    ? [
        { href: "/dashboard/admin",            label: "Dashboard",          icon: "fa-gauge-high", section: "OPERACIÓN" },
        { href: "/dashboard/admin/registros",  label: "Todos los Registros", icon: "fa-list-check" },
        { href: "/agente",                     label: "Agente IA",          icon: "fa-robot",      section: "INTELIGENCIA" },
      ]
    : [
        { href: "/dashboard/cliente",          label: "Mis Dispositivos",   icon: "fa-car-side",   section: "OPERACIÓN" },
        { href: "/dashboard/cliente/registros", label: "Mis Registros",     icon: "fa-list-check" },
        { href: "/registros/nuevo",            label: "Nuevo Registro",     icon: "fa-circle-plus" },
        { href: "/agente",                     label: "Agente IA",          icon: "fa-robot",      section: "INTELIGENCIA" },
      ]

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? "U"

  return (
    <aside
      className="w-[264px] shrink-0 flex flex-col h-screen sticky top-0 overflow-y-auto"
      style={{
        background: SURFACE,
        borderRight: `1px solid ${HAIRLINE}`,
        fontFamily: FONT_BODY,
        color: TEXT,
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 pb-5 pt-5"
        style={{ borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div
          className="w-9 h-9 rounded-[10px] grid place-items-center"
          style={{
            background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
            color: "#0a0a0a",
            boxShadow: "0 4px 18px rgba(255,154,0,0.35)",
          }}
        >
          <i className="fa-solid fa-satellite-dish text-base" />
        </div>
        <div className="leading-tight">
          <div style={{ fontFamily: FONT_DISPLAY, fontWeight: 800, fontSize: "1.05rem", letterSpacing: "-0.01em" }}>
            HalconSat
          </div>
          <div style={{ fontFamily: FONT_MONO, fontSize: "0.62rem", color: MUTED, letterSpacing: "0.08em" }}>
            GPS · {role ? role.toUpperCase() : "USER"}
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 flex flex-col">
        {links.map((link, idx) => {
          const active = pathname === link.href
          return (
            <div key={link.href}>
              {link.section && (
                <div
                  className="px-3 pb-2"
                  style={{
                    fontSize: "0.62rem",
                    color: MUTED,
                    letterSpacing: "0.14em",
                    fontWeight: 700,
                    marginTop: idx === 0 ? 0 : "1.1rem",
                  }}
                >
                  {link.section}
                </div>
              )}
              <Link
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[9px] relative transition-all"
                style={{
                  color: active ? ACCENT : TEXT_SOFT,
                  fontWeight: active ? 600 : 500,
                  fontSize: "0.87rem",
                  background: active ? "color-mix(in oklab, #ff9a00 12%, transparent)" : "transparent",
                }}
              >
                {active && (
                  <span
                    className="absolute left-[-12px] top-1/2 rounded-r-[3px]"
                    style={{ width: 3, height: 22, transform: "translateY(-50%)", background: ACCENT }}
                  />
                )}
                <i className={`fa-solid ${link.icon}`} style={{ width: 18, textAlign: "center", fontSize: "0.9rem", color: active ? ACCENT : MUTED }} />
                <span>{link.label}</span>
                {link.badge != null && (
                  <span
                    className="ml-auto rounded-full"
                    style={{
                      background: active ? ACCENT : "#e0392b",
                      color: active ? "#0a0a0a" : "white",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      padding: "2px 7px",
                      fontFamily: FONT_MONO,
                    }}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Footer: user + signout */}
      <div
        className="m-4 p-3 rounded-[12px]"
        style={{
          background: CARD_2,
          border: `1px solid ${HAIRLINE}`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-full grid place-items-center shrink-0"
            style={{
              background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_DIM})`,
              color: "#0a0a0a",
              fontFamily: FONT_DISPLAY,
              fontWeight: 700,
              fontSize: "0.78rem",
            }}
          >
            {initial}
          </div>
          <div className="flex-1 min-w-0 leading-tight">
            <div className="truncate" style={{ fontSize: "0.82rem", fontWeight: 600 }}>
              {session?.user?.name ?? "Usuario"}
            </div>
            <div className="truncate" style={{ fontSize: "0.66rem", color: MUTED, fontFamily: FONT_MONO }}>
              {session?.user?.email ?? ""}
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-8 h-8 rounded-[8px] grid place-items-center transition-colors"
            style={{ color: MUTED, border: `1px solid ${BORDER}` }}
            title="Cerrar sesión"
            onMouseEnter={(e) => { e.currentTarget.style.color = ACCENT; e.currentTarget.style.borderColor = ACCENT }}
            onMouseLeave={(e) => { e.currentTarget.style.color = MUTED; e.currentTarget.style.borderColor = BORDER }}
          >
            <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <BrandHead />
      <div
        className="flex h-screen"
        style={{ background: BG, color: TEXT, fontFamily: FONT_BODY }}
      >
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SessionProvider>
  )
}
