import { NextRequest, NextResponse } from 'next/server'
import { deleteTherapy, getTherapyById } from '../../../actions/therapies'
import { actionErrorResponse } from '@/lib/api/utils'
import { ParamsWithId } from '@/types'

export async function GET(_req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
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
  catch (e) {
    return actionErrorResponse(e)
  }
}

export async function DELETE(_req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    await deleteTherapy(id)
    return new NextResponse(null, { status: 204 })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
