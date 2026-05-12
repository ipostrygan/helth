'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SortingState } from '@tanstack/react-table'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { baseFilterParsers, defaultDateFrom, defaultDateTo } from '@/lib/search-params'
import { usePageProfile } from '../hooks/use-page-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useTherapies } from './hooks/use-therapies'
import { useDeleteTherapy } from './hooks/use-delete-therapy'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { TableTemplate, type SortChange } from '@/components/table-template'
import { prepareTherapyColumns } from './columns'

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Ongoing' },
  { value: 'false', label: 'Finished' }
]

const TherapiesPage = () => {
  const router = useRouter()
  const { isFamilyProfile, profile, profileId, isReady } = usePageProfile()
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('startDate'),
    isActive: parseAsArrayOf(parseAsString).withDefault([])
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteTherapy()

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined
  }
  const { data, isLoading, isFetching, isError } = useTherapies(params)

  const sorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  const columns = prepareTherapyColumns({
    onEdit: id => router.push(`/therapies/${id}/edit`),
    onDelete: setDeletingId,
    isFamilyProfile
  })

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  if (!isReady) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => router.push('/therapies/create')}
      addNewLabel="Add Therapy"
      title={isFamilyProfile ? 'Family\'s Therapies' : `${getProfileDisplayName(profile!)}'s Therapies`}
      description="Ongoing and finished therapy sessions"
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      pageSize={filters.pageSize}
      onPageChange={page => setFilters(prev => ({ ...prev, page }))}
      onPageSizeChange={pageSize => setFilters(prev => ({ ...prev, page: 1, pageSize }))}
      sorting={sorting}
      onSortingChange={onSortingChange}
      filters={{
        searchValue: filters.search,
        onSearchChange: search => setFilters(prev => ({ ...prev, page: 1, search })),
        searchPlaceholder: 'Search therapies...',
        dateRange,
        onDateRangeChange: (range: DateRange | undefined) =>
          setFilters(prev => ({
            ...prev,
            page: 1,
            dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : null
          })),
        filterGroups: [
          {
            label: 'Status',
            options: IS_ACTIVE_OPTIONS,
            selected: filters.isActive,
            onChange: isActive => setFilters(prev => ({ ...prev, page: 1, isActive }))
          }
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom !== defaultDateFrom || filters.dateTo !== defaultDateTo || filters.isActive.length > 0),
        onClearFilters: () => setFilters(() => ({ page: 1, pageSize: filters.pageSize, sortField: 'startDate', sortDirection: 'desc', search: '', dateFrom: null, dateTo: null, isActive: [] }))
      }}
      deleteConfig={{
        deletingId,
        onCancel: () => setDeletingId(null),
        onConfirm: () => {
          if (deletingId === null) return
          deleteItem(deletingId, { onSuccess: () => setDeletingId(null) })
        },
        isPending: isDeleting
      }}
    />
  )
}

export default function Page() {
  return <Suspense><TherapiesPage /></Suspense>
}
