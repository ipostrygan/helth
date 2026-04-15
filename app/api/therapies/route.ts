import { NextRequest, NextResponse } from 'next/server'
import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'
import { getTherapies } from '../../actions/therapies'
import { baseSearchParams, therapiesQueryParamsSchema } from '@/lib/search-params'
import { validateQueryParams } from '@/lib/api/utils'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams('startDate'),
  isActive: parseAsArrayOf(parseAsString)
})

export async function GET(req: NextRequest) {
  const parsed = searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))
  const validation = validateQueryParams(therapiesQueryParamsSchema, parsed)
  if (!validation.success) {
    return validation.response
  }
  const result = await getTherapies(validation.data)
  return NextResponse.json(result)
}
