import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});

console.log("KEY:", process.env.AWS_ACCESS_KEY_ID?.slice(0, 5));
console.log("SECRET:", !!process.env.AWS_SECRET_ACCESS_KEY);
console.log("REGION:", process.env.AWS_REGION);

export async function deleteS3Object(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
  });

  await s3.send(command);
}
