import { NextRequest, NextResponse } from 'next/server'
import { getSelfCareActivities } from '../../actions/self-care-activities'
import { baseSearchParams, selfCareActivitiesQueryParamsSchema } from '@/lib/search-params'
import { validateQueryParams } from '@/lib/api/utils'
import { createSearchParamsCache } from 'nuqs/server'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams('date')
})

export async function GET(req: NextRequest) {
  const parsed = searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))
  const validation = validateQueryParams(selfCareActivitiesQueryParamsSchema, parsed)
  if (!validation.success) {
    return validation.response
  }
  const result = await getSelfCareActivities(validation.data)
  return NextResponse.json(result)
}
