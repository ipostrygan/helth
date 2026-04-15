import { NextRequest, NextResponse } from 'next/server'
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString
} from 'nuqs/server'
import { getAppointments } from '../../actions/appointments'
import {
  baseSearchParams,
  appointmentsQueryParamsSchema
} from '@/lib/search-params'
import { validateQueryParams } from '@/lib/api/utils'

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
  const result = await getAppointments(validation.data)
  return NextResponse.json(result)
}
