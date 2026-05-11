import { NextRequest, NextResponse } from 'next/server'
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString
} from 'nuqs/server'
import { getAppointments } from '../../actions/appointments'
import { baseSearchParams } from '@/lib/search-params'
import { appointmentsQueryParamsSchema } from '@/app/(app)/appointments/search-params'
import { validateQueryParams, actionErrorResponse } from '@/lib/api/utils'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams(),
  statuses: parseAsArrayOf(parseAsString),
  therapyId: parseAsString
})

export async function GET(req: NextRequest) {
  const parsed = searchParamsCache.parse(
    Object.fromEntries(req.nextUrl.searchParams)
  )
  const validation = validateQueryParams(appointmentsQueryParamsSchema, parsed)
  if (!validation.success) {
    return validation.response
  }
  try {
    const result = await getAppointments(validation.data)
    return NextResponse.json(result)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
