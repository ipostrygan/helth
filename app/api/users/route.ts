import { NextResponse } from 'next/server'
import { getAllProfiles } from '../../actions/profile'

export async function GET() {
  const { error, data, status } = await getAllProfiles()
  if (error) return NextResponse.json({ error }, { status })
  return NextResponse.json(data)
}
