import { NextResponse } from "next/server";
import { getAllProfiles } from "../../actions/profile";

export async function GET() {
  const users = await getAllProfiles()
  return NextResponse.json(users);
}
