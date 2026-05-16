import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const session = req.auth
  const isLoggedIn = !!session
  const role = (session?.user as any)?.role

  // Rutas completamente públicas — nadie necesita login para verlas
  const publicRoutes = ["/", "/login"]
  if (publicRoutes.includes(nextUrl.pathname)) {
    // Si ya está logueado y va al login, lo manda al dashboard
    if (isLoggedIn && nextUrl.pathname === "/login") {
      return NextResponse.redirect(
        new URL(role === "admin" ? "/dashboard/admin" : "/dashboard/cliente", nextUrl)
      )
    }
    return NextResponse.next()
  }

  // API pública del chat de la landing — no requiere auth
  if (nextUrl.pathname.startsWith("/api/chat-publico")) {
    return NextResponse.next()
  }

  // Rutas privadas — requieren login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  // Proteger rutas de admin
  if (nextUrl.pathname.startsWith("/dashboard/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard/cliente", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"]
}
