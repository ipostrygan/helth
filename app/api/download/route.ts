import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import prisma from "@/lib/prisma";

async function isValidDocumentKey(key: string): Promise<boolean> {
  const [appointment, therapy, user] = await Promise.all([
    prisma.appointment.findFirst({ where: { relatedDocuments: { has: key } }, select: { id: true } }),
    prisma.therapy.findFirst({ where: { relatedDocuments: { has: key } }, select: { id: true } }),
    prisma.user.findFirst({ where: { imageKey: key }, select: { id: true } }),
  ]);
  return !!(appointment ?? therapy ?? user);
}

export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (!key) return new NextResponse(null, { status: 400 });

  const valid = await isValidDocumentKey(key);
  if (!valid) return new NextResponse(null, { status: 404 });

  const forceDownload = req.nextUrl.searchParams.get("download") === "true";
  const filename = key.split("/").pop() ?? "download";

  let result;
  try {
    result = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key })
    );
  } catch (err) {
    console.error("S3 fetch failed for key:", key, err)
    return new NextResponse(null, { status: 404 });
  }

  const body = result.Body;
  if (!body) return new NextResponse(null, { status: 404 });

  const headers = new Headers();
  if (result.ContentType) headers.set("Content-Type", result.ContentType);
  if (result.ContentLength) headers.set("Content-Length", String(result.ContentLength));
  headers.set(
    "Content-Disposition",
    forceDownload ? `attachment; filename="${filename}"` : `inline; filename="${filename}"`
  );

  return new NextResponse(body as unknown as ReadableStream, { headers });
}
