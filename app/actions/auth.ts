"use server"

import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

type LoginInput = {
  username: string
  password: string
}

export const login = async ({ username, password }: LoginInput) => {
  const auth = await prisma.auth.findUnique({ where: { username } })

  if (!auth || !(await bcrypt.compare(password, auth.password))) {
    return { error: "Invalid credentials" }
  }

  const token = jwt.sign(
    { sub: auth.id, username: auth.username },
    process.env.JWT_SECRET!,
    { expiresIn: "1d" }
  )

  const cookieStore = await cookies()
  cookieStore.set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return { success: true }
}

export const logout = async () => {
  const cookieStore = await cookies()
  cookieStore.delete("token")
}
