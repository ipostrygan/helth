import { NextRequest, NextResponse } from 'next/server'
import { deleteAppointment, getAppointmentById } from '../../../actions/appointments'
import { actionErrorResponse } from '@/lib/api/utils'
import { ParamsWithId } from '@/types'

export async function GET(_req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    const item = await getAppointmentById(id)
    if (!item) return new NextResponse(null, { status: 404 })

    const { relatedDocuments, ...rest } = item
    const documents = relatedDocuments.map((key) => {
      const name = key.split('/').pop() ?? key
      const baseUrl = `/api/download?key=${encodeURIComponent(key)}`
      return {
        key,
        name,
        url: baseUrl,
        downloadUrl: `${baseUrl}&download=true`
      }
    })

    return NextResponse.json({ ...rest, documents })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    await deleteAppointment(id)
    return new NextResponse(null, { status: 204 })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
