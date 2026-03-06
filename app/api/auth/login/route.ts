import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import { cookies } from "next/headers"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  const { username, password } = await req.json()

  const auth = await prisma.auth.findUnique({ where: { username } })

  if (!auth || !(await bcrypt.compare(password, auth.password))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
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

  return NextResponse.json({ success: true })
}
