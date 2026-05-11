import { NextRequest, NextResponse } from 'next/server'
import { getSelfCareActivities } from '../../actions/self-care-activities'
import { baseSearchParams } from '@/lib/search-params'
import { selfCareActivitiesQueryParamsSchema } from '@/app/(app)/self-care-activities/search-params'
import { validateQueryParams, actionErrorResponse } from '@/lib/api/utils'
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
  try {
    const result = await getSelfCareActivities(validation.data)
    return NextResponse.json(result)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
