import { NextRequest, NextResponse } from 'next/server'
import { deleteTherapy, getTherapyById } from '../../../actions/therapies'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getTherapyById(id)
  if (!item) return new NextResponse(null, { status: 404 })

  const { appointments, ...therapyData } = item

  const documents = therapyData.relatedDocuments.map((key) => {
    const name = key.split('/').pop() ?? key
    const baseUrl = `/api/download?key=${encodeURIComponent(key)}`
    return {
      key,
      name,
      url: baseUrl,
      downloadUrl: `${baseUrl}&download=true`
    }
  })

  const specialists = Array.from(
    new Map(
      appointments.map(a => [a.specialistName, { name: a.specialistName!, link: a.specialistLink ?? null }])
    ).values()
  )

  return NextResponse.json({ ...therapyData, documents, specialists })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteTherapy(id)
  return new NextResponse(null, { status: 204 })
}
