import { NextRequest, NextResponse } from "next/server";
import { deleteTherapy } from "../../../actions/therapies";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteTherapy(id);
  return new NextResponse(null, { status: 204 });
}
