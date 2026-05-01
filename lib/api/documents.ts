import { NextRequest, NextResponse } from 'next/server'
import { uploadS3Object, deleteS3Object } from '@/lib/s3'
import { validateFileSize } from '@/lib/utils'

const ALLOWED_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
]

interface DocumentHandlerOptions {
  getById: (id: string) => Promise<{ relatedDocuments: string[] } | null>
  addDocument: (id: string, key: string) => Promise<unknown>
  removeDocument: (id: string, key: string) => Promise<unknown>
}

async function uploadFile(
  id: string,
  file: File,
  addDocument: (id: string, key: string) => Promise<unknown>
) {
  const key = `medical-docs/${id}/${file.name}`
  await uploadS3Object(key, file, `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`)
  await addDocument(id, key)
}

export function createDocumentHandlers({ getById, addDocument, removeDocument }: DocumentHandlerOptions) {
  async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const entity = await getById(id)
    if (!entity) return new NextResponse(null, { status: 404 })

    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files.length) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const invalidFile = files.find(f => !ALLOWED_TYPES.includes(f.type))
    if (invalidFile) {
      return NextResponse.json(
        { error: `Unsupported file type: ${invalidFile.type}. Only PDF and image files are allowed.` },
        { status: 400 }
      )
    }

    const sizeError = files.map(f => validateFileSize(f)).find(Boolean)
    if (sizeError) {
      return NextResponse.json({ error: sizeError }, { status: 400 })
    }

    try {
      await Promise.all(files.map(file => uploadFile(id, file, addDocument)))
      return NextResponse.json(null, { status: 201 })
    }
    catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
  }

  async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const entity = await getById(id)

    const { key } = await req.json()
    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    if (!entity || !entity.relatedDocuments.includes(key)) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    try {
      await deleteS3Object(key)
      await removeDocument(id, key)
      return new NextResponse(null, { status: 204 })
    }
    catch (err) {
      console.error(err)
      return NextResponse.json({ error: 'Delete failed' }, { status: 500 })
    }
  }

  return { POST, DELETE }
}
