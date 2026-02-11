"use server"

import { sql } from "@/lib/db"
import { hashPassword, verifyPassword, createSession, deleteSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string

  if (!email || !password || !name) {
    return { error: "All fields are required" }
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" }
  }

  const existing = await sql`SELECT id FROM users WHERE email = ${email}`
  if (existing.length > 0) {
    return { error: "Email already registered" }
  }

  const passwordHash = await hashPassword(password)

  const result = await sql`
    INSERT INTO users (email, password_hash, name, role)
    VALUES (${email}, ${passwordHash}, ${name}, 'student')
    RETURNING id, role
  `

  const user = result[0] as any
  await createSession(user.id as number)
  
  if (user.role === "admin") {
    redirect("/admin")
  }
  redirect("/scholiums")
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const result = await sql`
    SELECT id, password_hash, role FROM users WHERE email = ${email}
  `

  if (result.length === 0) {
    return { error: "Invalid email or password" }
  }

  const user = result[0] as any
  const valid = await verifyPassword(password, user.password_hash as string)

  if (!valid) {
    return { error: "Invalid email or password" }
  }

  await createSession(user.id as number)
  
  if (user.role === "admin") {
    redirect("/admin")
  }
  redirect("/scholiums")
}

export async function signOut() {
  await deleteSession()
  redirect("/")
}
