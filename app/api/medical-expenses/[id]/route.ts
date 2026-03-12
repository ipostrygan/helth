import { NextRequest, NextResponse } from "next/server";
import { deleteExpense } from "../../../actions/medical-expenses";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteExpense(id);
  return new NextResponse(null, { status: 204 });
}
