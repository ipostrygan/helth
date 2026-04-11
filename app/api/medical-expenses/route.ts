import { NextRequest, NextResponse } from 'next/server'
import { createSearchParamsCache, parseAsArrayOf, parseAsString } from 'nuqs/server'
import { getMedicalExpenses } from '../../actions/medical-expenses'
import { baseSearchParams } from '@/lib/search-params'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams(),
  types: parseAsArrayOf(parseAsString),
  therapyId: parseAsString,
  appointmentId: parseAsString
})

export async function GET(req: NextRequest) {
  const { profileId, page, pageSize, sortField, sortDirection, search, dateFrom, dateTo, types, therapyId, appointmentId } = searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))

  const result = await getMedicalExpenses({
    profileId: profileId ?? undefined,
    page,
    pageSize,
    sortField,
    sortDirection,
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    types: types ?? undefined,
    therapyId: therapyId ?? undefined,
    appointmentId: appointmentId ?? undefined
  })
  return NextResponse.json(result)
}
