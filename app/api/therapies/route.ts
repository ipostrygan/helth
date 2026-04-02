import { NextRequest, NextResponse } from 'next/server'
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from 'nuqs/server'
import { getTherapies } from '../../actions/therapies'
import { Therapy } from '@/lib/generated/prisma/client'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/constants'

const searchParamsCache = createSearchParamsCache({
  profileId: parseAsString,
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortField: parseAsString.withDefault('startDate'),
  sortDirection: parseAsString.withDefault('desc'),
  search: parseAsString.withDefault(''),
  dateFrom: parseAsString,
  dateTo: parseAsString,
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
    sortDirection: sortDirection as 'asc' | 'desc',
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    isActive: isActive ?? undefined
  })
  return NextResponse.json(result)
}
