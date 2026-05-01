import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.APP_AWS_REGION,
  credentials: {
    accessKeyId: process.env.APP_AWS_ACCESS_KEY!.trim(),
    secretAccessKey: process.env.APP_AWS_SECRET_KEY!.trim()
  }
})

export async function uploadS3Object(key: string, file: File, contentDisposition = `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`) {
  const buffer = Buffer.from(await file.arrayBuffer())
  await s3.send(new PutObjectCommand({
    Bucket: process.env.APP_S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: file.type,
    ContentLength: buffer.length,
    ContentDisposition: contentDisposition
  }))
}

export async function getS3Object(key: string) {
  return s3.send(new GetObjectCommand({
    Bucket: process.env.APP_S3_BUCKET!,
    Key: key
  }))
}

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.APP_S3_BUCKET!,
    Key: key
  })

  await s3.send(command)
}
