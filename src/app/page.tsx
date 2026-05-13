import { redirect } from "next/navigation"
import { auth } from "@/auth"

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect("/login")
  const role = (session.user as any)?.role
  redirect(role === "admin" ? "/dashboard/admin" : "/dashboard/cliente")
}
