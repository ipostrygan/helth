import { editProfile } from '@/app/actions/profile'
import { s3 } from '@/lib/s3'
import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import prisma from '@/lib/prisma'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const ext = file.name.split('.').pop()
    const key = `users/${id}/profile${ext ? `.${ext}` : ''}`

    const user = await prisma.user.findUnique({ where: { id }, select: { imageKey: true } })
    const oldKey = user?.imageKey

    await s3.send(new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: buffer.length
    }))

    if (oldKey && oldKey !== key) {
      await s3.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: oldKey }))
    }

    await editProfile(id, {
      imageKey: key
    })

    return new Response(
      JSON.stringify({ message: 'File uploaded successfully' }),
      { status: 200 }
    )
  }
  catch (err) {
    console.log(err)
    return new Response(
      JSON.stringify({ error: 'Upload failed' }),
      { status: 500 }
    )
  }
}
