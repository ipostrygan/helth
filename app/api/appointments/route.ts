import { NextRequest, NextResponse } from 'next/server'
import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'
import { getAppointments } from '../../actions/appointments'
import { baseSearchParams } from '@/lib/search-params'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams(),
  statuses: parseAsArrayOf(parseAsString),
  therapyId: parseAsString
})

export async function GET(req: NextRequest) {
  const { profileId, page, pageSize, sortField, sortDirection, search, dateFrom, dateTo, statuses, therapyId }
    = searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))

  const result = await getAppointments({
    profileId: profileId ?? undefined,
    page,
    pageSize,
    sortField,
    sortDirection,
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    statuses: statuses ?? undefined,
    therapyId: therapyId ?? undefined
  })
  return NextResponse.json(result)
}
