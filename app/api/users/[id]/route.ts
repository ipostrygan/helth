import { NextResponse } from 'next/server'
import { editProfile, getProfile } from '../../../actions/profile'
import { actionErrorResponse } from '@/lib/api/utils'
import { ParamsWithId } from '@/types'

export async function GET(_: Request, { params }: ParamsWithId) {
  const { id } = await params
  try {
    const data = await getProfile(id)
    return NextResponse.json(data)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}

export async function PUT(req: Request, { params }: ParamsWithId) {
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
