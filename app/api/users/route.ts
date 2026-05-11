import { NextResponse } from 'next/server'
import { getAllProfiles } from '../../actions/profile'
import { actionErrorResponse } from '@/lib/api/utils'

export async function GET() {
  try {
    const data = await getAllProfiles()
    return NextResponse.json(data)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
