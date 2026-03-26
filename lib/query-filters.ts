import { parseAsInteger, parseAsString } from "nuqs"
import { format, subMonths } from "date-fns"
import { DEFAULT_PAGE_SIZE } from "./constants"

export const defaultDateFrom = format(subMonths(new Date(), 1), "yyyy-MM-dd")
export const defaultDateTo = format(new Date(), "yyyy-MM-dd")

export const baseFilterParsers = (defaultSortField = "date") => ({
  page:          parseAsInteger.withDefault(1),
  pageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortField:     parseAsString.withDefault(defaultSortField),
  sortDirection: parseAsString.withDefault("desc"),
  search:        parseAsString.withDefault(""),
  dateFrom:      parseAsString.withDefault(defaultDateFrom),
  dateTo:        parseAsString.withDefault(defaultDateTo),
})
