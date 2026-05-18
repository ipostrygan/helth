import type { SortingState } from '@tanstack/react-table'
import type { SortChange } from '@/components/table-template'

type SortFilters = {
  sortField: string
  sortDirection: string
}

export function useSorting<T extends SortFilters>(
  filters: T,
  setFilters: (updater: (prev: T) => Partial<T>) => unknown
) {
  const sorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]

  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  return { sorting, onSortingChange }
}
