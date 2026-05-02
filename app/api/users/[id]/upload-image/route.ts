import { editProfile } from '@/app/actions/profile'
import { deleteS3Object, uploadS3Object } from '@/lib/s3'
import prisma from '@/lib/prisma'
import { validateFileSize } from '@/lib/utils'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File

    const sizeError = validateFileSize(file)
    if (sizeError) {
      return new Response(JSON.stringify({ error: sizeError }), { status: 400 })
    }

    const ext = file.name.split('.').pop()

    const user = await prisma.user.findUnique({ where: { id }, select: { imageKey: true, firstName: true, fullName: true } })
    const oldKey = user?.imageKey

    const nameSource = user?.firstName ?? user?.fullName ?? 'user'
    const safeName = nameSource.toLowerCase().replace(/[^a-z0-9]/g, '-')
    const key = `users/${safeName}-${id}${ext ? `.${ext}` : ''}`

    await uploadS3Object(key, file)

    if (oldKey && oldKey !== key) {
      await deleteS3Object(oldKey)
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
