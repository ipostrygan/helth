// table
export type SortDirection = 'asc' | 'desc'

export type PaginatedResult<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// queries
export type BaseQueryParams = {
  profileId?: string
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

// app
export type PageProps = {
  params: Promise<{ id: string }>
}
