import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
import {
  baseFilterParsers,
  defaultDateFrom,
  defaultDateTo
} from '@/lib/search-params'
import { useSorting } from '@/hooks/use-sorting'
import type { FiltersConfig } from '@/components/table-template'

type FilterGroupDef = {
  key: string
  label: string
  options: { value: string, label: string }[]
}

export function useTableFilters({
  defaultSortField = 'date',
  searchPlaceholder = 'Search...',
  filterGroups = []
}: {
  defaultSortField?: string
  searchPlaceholder?: string
  filterGroups?: FilterGroupDef[]
} = {}) {
  const extraParsersMap = Object.fromEntries(
    filterGroups.map(group => [
      group.key,
      parseAsArrayOf(parseAsString).withDefault([])
    ])
  )

  const [filters, setFilters] = useQueryStates(
    baseFilterParsers(defaultSortField)
  )
  const [extraFilters, setExtraFilters] = useQueryStates(extraParsersMap)

  const { sorting, onSortingChange } = useSorting(filters, setFilters)

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined
        }
      : undefined

  const hasActiveFilters = !!(
    filters.search
    || filters.dateFrom !== defaultDateFrom
    || filters.dateTo !== defaultDateTo
    || filterGroups.some(group => extraFilters[group.key]?.length > 0)
  )

  const filtersConfig: FiltersConfig = {
    searchValue: filters.search,
    onSearchChange: search =>
      setFilters(prev => ({ ...prev, page: 1, search })),
    searchPlaceholder,
    dateRange,
    onDateRangeChange: (range: DateRange | undefined) =>
      setFilters(prev => ({
        ...prev,
        page: 1,
        dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
        dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : null
      })),
    filterGroups: filterGroups.map(group => ({
      label: group.label,
      options: group.options,
      selected: extraFilters[group.key] ?? [],
      onChange: (selected: string[]) => {
        setFilters(prev => ({ ...prev, page: 1 }))
        setExtraFilters(prev => ({ ...prev, [group.key]: selected }))
      }
    })),
    hasActiveFilters,
    onClearFilters: () => {
      setFilters(() => ({
        page: 1,
        pageSize: filters.pageSize,
        sortField: defaultSortField,
        sortDirection: 'desc',
        search: '',
        dateFrom: null,
        dateTo: null
      }))
      setExtraFilters(() =>
        Object.fromEntries(filterGroups.map(group => [group.key, []]))
      )
    }
  }

  return {
    filters,
    extraFilters,
    filtersConfig,
    sorting,
    onSortingChange,
    onPageChange: (page: number) => setFilters(prev => ({ ...prev, page })),
    onPageSizeChange: (pageSize: number) =>
      setFilters(prev => ({ ...prev, page: 1, pageSize }))
  }
}
