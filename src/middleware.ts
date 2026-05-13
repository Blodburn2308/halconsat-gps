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
