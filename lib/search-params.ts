import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server'
import { format, subMonths } from 'date-fns'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { SORT_DIRECTIONS } from '@/types'

export const defaultDateFrom = format(subMonths(new Date(), 4), 'yyyy-MM-dd')
export const defaultDateTo = format(new Date(), 'yyyy-MM-dd')

export const baseFilterParsers = (defaultSortField = 'date') => ({
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortField: parseAsString.withDefault(defaultSortField),
  sortDirection: parseAsStringEnum([...SORT_DIRECTIONS]).withDefault('desc'),
  search: parseAsString.withDefault(''),
  dateFrom: parseAsString.withDefault(defaultDateFrom),
  dateTo: parseAsString.withDefault(defaultDateTo)
})

export const baseSearchParams = (defaultSortField = 'date') => ({
  profileId: parseAsString,
  ...baseFilterParsers(defaultSortField),
  dateFrom: parseAsString,
  dateTo: parseAsString
})
