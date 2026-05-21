'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePageProfile } from '@/hooks/use-page-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useTherapies } from './hooks/use-therapies'
import { useDeleteTherapy } from './hooks/use-delete-therapy'
import { TableTemplate } from '@/components/table-template'
import { useTableFilters } from '@/hooks/use-table-filters'
import { prepareTherapyColumns } from './columns'

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Ongoing' },
  { value: 'false', label: 'Finished' }
]

const TherapiesPage = () => {
  const router = useRouter()
  const { isFamilyProfile, profile, profileId, isReady } = usePageProfile()

  const {
    filters,
    extraFilters,
    filtersConfig,
    sorting,
    onSortingChange,
    onPageChange,
    onPageSizeChange
  } = useTableFilters({
    defaultSortField: 'startDate',
    searchPlaceholder: 'Search therapies...',
    filterGroups: [
      { key: 'isActive', label: 'Status', options: IS_ACTIVE_OPTIONS }
    ]
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteTherapy()

  const params = {
    profileId,
    ...filters,
    ...extraFilters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined
  }
  const { data, isLoading, isFetching, isError } = useTherapies(params)

  const columns = prepareTherapyColumns({
    onEdit: id => router.push(`/therapies/${id}/edit`),
    onDelete: setDeletingId,
    isFamilyProfile
  })

  if (!isReady) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => router.push('/therapies/create')}
      addNewLabel="Add Therapy"
      title={
        isFamilyProfile
          ? 'Family\'s Therapies'
          : `${getProfileDisplayName(profile!)}'s Therapies`
      }
      description="Ongoing and finished therapy sessions"
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      pageSize={filters.pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      filters={filtersConfig}
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
  return (
    <Suspense>
      <TherapiesPage />
    </Suspense>
  )
}
