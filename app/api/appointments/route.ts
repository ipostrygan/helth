import { NextRequest, NextResponse } from "next/server";
import { createSearchParamsCache, parseAsArrayOf, parseAsInteger, parseAsString } from "nuqs/server";
import { getAppointments } from "../../actions/appointments";
import { Appointment } from "@/lib/generated/prisma/client";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from "@/lib/constants";

const searchParamsCache = createSearchParamsCache({
  profileId:     parseAsString,
  page:          parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortField:     parseAsString.withDefault("date"),
  sortDirection: parseAsString.withDefault("desc"),
  search:        parseAsString.withDefault(""),
  dateFrom:      parseAsString,
  dateTo:        parseAsString,
  statuses:      parseAsArrayOf(parseAsString),
  therapyId:     parseAsString,
})

export async function GET(req: NextRequest) {
  const { profileId, page, pageSize, sortField, sortDirection, search, dateFrom, dateTo, statuses, therapyId } =
    searchParamsCache.parse(Object.fromEntries(req.nextUrl.searchParams))

  const result = await getAppointments({
    profileId: profileId ?? undefined,
    page,
    pageSize,
    sortField: sortField as keyof Appointment,
    sortDirection: sortDirection as "asc" | "desc",
    search,
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
    statuses: statuses ?? undefined,
    therapyId: therapyId ?? undefined,
  })
  return NextResponse.json(result)
}
