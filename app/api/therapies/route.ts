import { NextRequest, NextResponse } from 'next/server'
import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'
import { getTherapies } from '../../actions/therapies'
import { Therapy } from '@/lib/generated/prisma/client'
import { baseSearchParams } from '@/lib/search-params'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams('startDate'),
  isActive: parseAsArrayOf(parseAsString)
})

export async function GET(req: NextRequest) {
  const { profileId, page, pageSize, sortField, sortDirection, search, dateFrom, dateTo, isActive }
    = searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))

  const result = await getTherapies({
    profileId: profileId ?? undefined,
    page,
    pageSize,
    sortField: sortField as keyof Therapy,
    sortDirection,
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    isActive: isActive ?? undefined
  })
  return NextResponse.json(result)
}
