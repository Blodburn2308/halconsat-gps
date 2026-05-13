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
