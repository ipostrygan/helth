import { editProfile } from "@/app/actions/profile";
import { s3 } from "@/lib/s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: file.name,
      Body: buffer, 
      ContentType: file.type,
      ContentLength: buffer.length,
    })
    
    await s3.send(command)

    await editProfile(Number(id), {
      imageKey: file.name
    })
    
    return new Response(
      JSON.stringify({ message: "File uploaded successfully" }),
      { status: 200 }
    );
  } catch (err) {
    console.log(err)
    return new Response(
      JSON.stringify({ error: "Upload failed" }),
      { status: 500 }
    );
  }
}