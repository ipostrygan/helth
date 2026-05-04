import { NextRequest, NextResponse } from 'next/server'
import { deleteAppointment, getAppointmentById } from '../../../actions/appointments'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteAppointment(id)
  return new NextResponse(null, { status: 204 })
}
