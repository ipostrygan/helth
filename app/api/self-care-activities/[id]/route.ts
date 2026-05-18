import { NextRequest, NextResponse } from 'next/server'
import { deleteSelfCareActivity, getSelfCareActivityById } from '../../../actions/self-care-activities'
import { actionErrorResponse } from '@/lib/api/utils'
import { ParamsWithId } from '@/types'

export async function GET(_req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    const item = await getSelfCareActivityById(id)
    if (!item) return new NextResponse(null, { status: 404 })
    return NextResponse.json(item)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    await deleteSelfCareActivity(id)
    return new NextResponse(null, { status: 204 })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
