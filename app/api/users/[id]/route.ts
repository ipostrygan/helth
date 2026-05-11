import { NextResponse } from 'next/server'
import { editProfile, getProfile } from '../../../actions/profile'
import { actionErrorResponse } from '@/lib/api/utils'

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const data = await getProfile(id)
    return NextResponse.json(data)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const data = await req.json()
  try {
    await editProfile(id, data)
    return NextResponse.json({ success: true })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
