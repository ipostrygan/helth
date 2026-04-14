import { NextRequest, NextResponse } from 'next/server'
import { getSelfCareActivities } from '../../actions/self-care-activities'
import { SelfCareActivity } from '@/lib/generated/prisma/client'
import { baseSearchParams } from '@/lib/search-params'
import { createSearchParamsCache } from 'nuqs/server'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams('date')
})

export async function GET(req: NextRequest) {
  const { profileId, page, pageSize, sortField, sortDirection, search, dateFrom, dateTo }
    = searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))

  const result = await getSelfCareActivities({
    profileId: profileId ?? undefined,
    page,
    pageSize,
    sortField: sortField as keyof SelfCareActivity,
    sortDirection,
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined
  })
  return NextResponse.json(result)
}
