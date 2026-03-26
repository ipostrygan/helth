import { NextRequest, NextResponse } from "next/server";
import { deleteExpense, getMedicalExpenseById } from "../../../actions/medical-expenses";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = await getMedicalExpenseById(id);
  if (!item) return new NextResponse(null, { status: 404 });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await deleteExpense(id);
  return new NextResponse(null, { status: 204 });
}
