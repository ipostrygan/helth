import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getTherapyAppointmentDocuments } from '../../../../actions/therapies'
import { removeDocument } from '@/lib/document-actions'
import { actionErrorResponse } from '@/lib/api/utils'
import prisma from '@/lib/prisma'
import { ParamsWithId } from '@/types'

const querySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
})

export async function GET(req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams))
    if (!parsed.success) return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })

    const { page, pageSize } = parsed.data
    const result = await getTherapyAppointmentDocuments(id, page, pageSize)
    if (!result) return new NextResponse(null, { status: 404 })

    const documents = result.keys.map((item) => {
      const name = item.key.split('/').pop() ?? item.key
      const baseUrl = `/api/download?key=${encodeURIComponent(item.key)}`
      return {
        key: item.key,
        name,
        url: baseUrl,
        downloadUrl: `${baseUrl}&download=true`,
        ...(item.appointmentId ? { appointmentId: item.appointmentId } : {})
      }
    })

    return NextResponse.json({ documents, total: result.total, page, pageSize })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}

const deleteSchema = z.object({
  key: z.string().min(1),
  appointmentId: z.string().optional()
})

export async function DELETE(req: NextRequest, { params }: ParamsWithId) {
  const { id } = await params
  try {
    const body = await req.json()
    const parsed = deleteSchema.safeParse(body)
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })

    const { key, appointmentId } = parsed.data

    if (appointmentId) {
      await removeDocument(prisma.appointment, appointmentId, key)
    } else {
      await removeDocument(prisma.therapy, id, key)
    }

    return new NextResponse(null, { status: 204 })
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
