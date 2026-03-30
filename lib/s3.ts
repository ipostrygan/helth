import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });

  await s3.send(command);
}
