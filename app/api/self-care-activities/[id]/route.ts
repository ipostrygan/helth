import { NextRequest, NextResponse } from 'next/server'
import { deleteSelfCareActivity } from '../../../actions/self-care-activities'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteSelfCareActivity(id)
  return new NextResponse(null, { status: 204 })
}
