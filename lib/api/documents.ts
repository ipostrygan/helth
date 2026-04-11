import { NextRequest, NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3, deleteS3Object } from '@/lib/s3'
import { randomUUID } from 'crypto'

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

    try {
      for (const file of files) {
        const key = `medical-docs/${id}/${randomUUID()}/${file.name}`

        const buffer = Buffer.from(await file.arrayBuffer())

        await s3.send(
          new PutObjectCommand({
            Bucket: process.env.APP_S3_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: file.type,
            ContentLength: buffer.length,
            ContentDisposition: `attachment; filename="${file.name}"`
          })
        )

        await addDocument(id, key)
      }

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
    if (!entity) return new NextResponse(null, { status: 404 })

    const { key } = await req.json()
    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    if (!entity.relatedDocuments.includes(key)) {
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
