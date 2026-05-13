# Proyecto: Halconsat GPS Security System

Aplicación web universitaria (Administración de Bases de Datos — Ingeniería en Software).
Empresa ficticia **Halconsat**: seguridad vehicular mediante dispositivos GPS.

## ¿Qué construimos?
Una plataforma con 3 componentes:
- **Base de datos vectorial** (ChromaDB): guarda eventos GPS como embeddings para búsqueda semántica
- **Dashboard** con 10 métricas de rendimiento del sistema en tiempo real
- **Agente conversacional** (Claude API): responde preguntas sobre los datos en lenguaje natural

## Dos roles de usuario
- **Admin** → ve todos los registros, todas las métricas, errores del sistema
- **Cliente** → registra sus dispositivos GPS, ve solo sus propios datos, consulta al agente

## Stack
Next.js 14 · TypeScript · Tailwind CSS · shadcn/ui · NextAuth.js · ChromaDB · OpenAI Embeddings · Claude API · Recharts · Vercel

## Plan de 5 días (metodología XP)
- Día 1: Auth con roles + estructura de páginas ← **ESTAMOS AQUÍ**
- Día 2: Formulario GPS + ChromaDB + embeddings
- Día 3: Agente conversacional
- Día 4: Dashboard con las 10 métricas
- Día 5: Pruebas + documentación + entrega


# CLAUDE.md — Halconsat GPS · Día 1

## Contexto
Aplicación web para empresa de seguridad vehicular GPS llamada **Halconsat**.
Next.js 14 + TypeScript + Tailwind + shadcn/ui ya están instalados.

## Colores de la marca
- Navy: `#1A3C5E`
- Azul: `#2E86AB`
- Verde-azul: `#17A398`

## Usuarios de prueba
```
admin@halconsat.com   / admin123  → rol: "admin"
cliente@halconsat.com / cliente123 → rol: "cliente"
```

## Variables de entorno
Crea `.env.local` en la raíz:
```env
AUTH_SECRET="halconsat-secret-key-2024-cambiar-en-produccion"
NEXTAUTH_URL="http://localhost:3000"
```

---

## TAREAS DE HOY — ejecutar en orden

---

### TAREA 1 · Instalar NextAuth
```bash
npm install next-auth@beta
```

---

### TAREA 2 · Crear `src/auth.ts`
```typescript
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const USERS = [
  { id: "1", email: "admin@halconsat.com", password: "admin123", name: "Admin Halconsat", role: "admin" },
  { id: "2", email: "cliente@halconsat.com", password: "cliente123", name: "Carlos Méndez", role: "cliente" }
]

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const user = USERS.find(
          u => u.email === credentials.email && u.password === credentials.password
        )
        return user ? { id: user.id, email: user.email, name: user.name, role: user.role } as any : null
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as any).role
      return token
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).role = token.role
      return session
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" }
})
```

---

### TAREA 3 · Crear `src/app/api/auth/[...nextauth]/route.ts`
```typescript
import { handlers } from "@/auth"
export const { GET, POST } = handlers
```

---

### TAREA 4 · Crear `src/middleware.ts`
```typescript
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const role = (session?.user as any)?.role

  if (nextUrl.pathname === "/login") {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(role === "admin" ? "/dashboard/admin" : "/dashboard/cliente", nextUrl))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  if (nextUrl.pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/cliente", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
}
```

---

### TAREA 5 · Reemplazar `src/app/page.tsx`
```typescript
import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect("/login")
  const role = (session.user as any)?.role
  redirect(role === "admin" ? "/dashboard/admin" : "/dashboard/cliente")
}
```

---

### TAREA 6 · Crear `src/app/login/page.tsx`
```typescript
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
```

---

### TAREA 7 · Crear `src/app/dashboard/layout.tsx`
```typescript
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
```

---

### TAREA 8 · Crear `src/app/dashboard/admin/page.tsx`
```typescript
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
```

---

### TAREA 9 · Crear `src/app/dashboard/cliente/page.tsx`
```typescript
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
```

---

### TAREA 10 · Verificar y hacer commit

Corre el servidor:
```bash
npm run dev
```

Comprueba estas 5 cosas en el navegador:
1. `http://localhost:3000` → redirige a `/login`
2. Login `admin@halconsat.com` / `admin123` → va a `/dashboard/admin`
3. Login `cliente@halconsat.com` / `cliente123` → va a `/dashboard/cliente`
4. Con sesión de cliente, ir a `/dashboard/admin` → redirige a `/dashboard/cliente`
5. Botón "Cerrar sesión" → regresa al login

Si todo pasa, sube el código:
```bash
git add .
git commit -m "feat: Day1 - auth con roles, dashboard admin/cliente, login UI Halconsat"
git push origin main
```

**Día 1 completado. ✅**
