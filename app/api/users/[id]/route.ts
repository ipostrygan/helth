import { NextResponse } from 'next/server'
import { editProfile, getProfile } from '../../../actions/profile'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { error, data, status } = await getProfile(id)
  if (error) return NextResponse.json({ error }, { status })
  return NextResponse.json(data)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  const { error, status } = await editProfile(id, data)
  if (error) return NextResponse.json({ error }, { status })
  return NextResponse.json({ success: true })
}
