import { NextResponse } from "next/server";
import { getMedicalExpenses } from "../../actions/medical-expenses";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("pageSize") ?? 10);

  const result = await getMedicalExpenses(page, pageSize);
  return NextResponse.json(result);
}
