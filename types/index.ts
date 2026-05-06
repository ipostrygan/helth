// table
export const SORT_DIRECTIONS = ['asc', 'desc'] as const
export type SortDirection = typeof SORT_DIRECTIONS[number]

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// queries
export type BaseQueryParams = {
  profileId?: string | null
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: string
  search?: string
  dateFrom?: string | null
  dateTo?: string | null
}

// app
export type PageProps = {
  params: Promise<{ id: string }>
}

// profile
export type ProfileSummary = {
  firstName: string | null
  shortName: string | null
  profileType: string
}
