import { NextRequest, NextResponse } from 'next/server'
import { deleteTherapy, getTherapyById } from '../../../actions/therapies'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const item = await getTherapyById(id)
  if (!item) return new NextResponse(null, { status: 404 })

  const documents = item.relatedDocuments.map((key) => {
    const name = key.split('/').pop() ?? key
    const encodedKey = encodeURIComponent(key)
    const encodedName = encodeURIComponent(name)
    return {
      key,
      name,
      url: `/api/download/${encodedName}?key=${encodedKey}`,
      downloadUrl: `/api/download/${encodedName}?key=${encodedKey}&download=true`
    }
  })

  return NextResponse.json({ ...item, documents })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteTherapy(id)
  return new NextResponse(null, { status: 204 })
}
