"use client"

import { useSession, signOut, SessionProvider } from "next-auth/react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function Sidebar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const role = (session?.user as any)?.role

  const links = role === "admin"
    ? [
        { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
        { href: "/dashboard/admin/registros", label: "Todos los Registros", icon: "📋" },
        { href: "/agente", label: "Agente IA", icon: "🤖" },
      ]
    : [
        { href: "/dashboard/cliente", label: "Mis Dispositivos", icon: "📍" },
        { href: "/dashboard/cliente/registros", label: "Mis Registros", icon: "📋" },
        { href: "/registros/nuevo", label: "Nuevo Registro", icon: "➕" },
        { href: "/agente", label: "Agente IA", icon: "🤖" },
      ]

  return (
    <aside className="w-64 bg-[#1A3C5E] text-white flex flex-col shrink-0">
      <div className="p-6 border-b border-[#2E86AB]">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛰️</span>
          <div>
            <h1 className="font-bold text-lg leading-none">Halconsat</h1>
            <p className="text-xs text-[#90CAF9] mt-0.5">GPS Security</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(link => (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              pathname === link.href
                ? "bg-[#2E86AB] text-white"
                : "text-[#90CAF9] hover:bg-[#2E86AB] hover:text-white"
            }`}
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-[#2E86AB]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 bg-[#2E86AB] rounded-full flex items-center justify-center text-sm font-bold">
            {session?.user?.name?.[0] ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{session?.user?.name}</p>
            <Badge className={`text-xs px-1 py-0 ${role === "admin" ? "bg-amber-500" : "bg-[#2E86AB]"} text-white`}>
              {role?.toUpperCase()}
            </Badge>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-[#2E86AB] text-[#90CAF9] hover:bg-[#2E86AB] hover:text-white bg-transparent text-xs"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          Cerrar sesión
        </Button>
      </div>
    </aside>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </SessionProvider>
  )
}
