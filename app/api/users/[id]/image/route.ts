import { getS3Object } from '@/lib/s3'
import prisma from '@/lib/prisma'
import { ParamsWithId } from '@/types'

export async function GET(
  _req: Request,
  { params }: ParamsWithId
) {
  const { id } = await params

  const user = await prisma.user.findUnique({ where: { id }, select: { imageKey: true } })
  if (!user?.imageKey) return new Response(null, { status: 204 })

  let result
  try {
    result = await getS3Object(user.imageKey)
  }
  catch {
    return new Response(null, { status: 204 })
  }

  if (!result.Body) return new Response(null, { status: 204 })

  const headers = new Headers()
  if (result.ContentType) headers.set('Content-Type', result.ContentType)
  if (result.ContentLength) headers.set('Content-Length', String(result.ContentLength))
  headers.set('Cache-Control', 'private, max-age=3600')

  return new Response(result.Body.transformToWebStream(), { headers })
}
