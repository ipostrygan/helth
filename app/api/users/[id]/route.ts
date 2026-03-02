import { NextResponse } from "next/server";
import { editProfile, getProfile } from "../../../actions/profile";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }>}) {
  const { id } = await params
  const user = await getProfile(Number(id))
  return NextResponse.json(user);
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  await editProfile(Number(id), data)
  return NextResponse.json({ success: true })
}
