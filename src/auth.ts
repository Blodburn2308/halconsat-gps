import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

const BACKEND = process.env.CHROMA_BACKEND_URL || "http://localhost:8000"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          const email = String(credentials?.email ?? "")
          const password = String(credentials?.password ?? "")
          if (!email || !password) return null

          const url = `${BACKEND}/usuarios/verificar?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
          const res = await fetch(url)
          if (!res.ok) return null
          const user = await res.json()
          if (!user || !user.activo) return null

          return {
            id: user.id,
            email: user.email,
            name: user.nombre,
            role: user.rol,
            placa: user.placa,
            dispositivo_id: user.dispositivo_id,
          } as any
        } catch {
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
        token.placa = (user as any).placa
        token.dispositivo_id = (user as any).dispositivo_id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role
        ;(session.user as any).placa = token.placa
        ;(session.user as any).dispositivo_id = token.dispositivo_id
      }
      return session
    }
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt" }
})
