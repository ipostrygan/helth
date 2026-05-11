'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { baseFilterParsers, defaultDateFrom, defaultDateTo } from '@/lib/search-params'
import { useActiveProfile } from '@/context/profile-context'
import { useProfile } from '../users/hooks/use-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useAppointments } from './hooks/use-appointments'
import { useDeleteAppointment } from './hooks/use-delete-appointment'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { APPOINTMENT_STATUS_LABELS } from './constants'
import { prepareAppointmentColumns } from './columns'
import { TableTemplate, type SortChange } from '@/components/table-template'

const AppointmentsPage = () => {
  const router = useRouter()
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('date'),
    statuses: parseAsArrayOf(parseAsString).withDefault([])
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteAppointment()

  const profileId = isFamilyProfile ? undefined : activeProfileId

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    statuses: filters.statuses
  }
  const { data, isLoading, isFetching, isError } = useAppointments(params)

  const sorting = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  const columns = prepareAppointmentColumns({
    showCost: true,
    onEdit: id => router.push(`/appointments/${id}/edit`),
    onDelete: id => setDeletingId(id),
    isFamilyProfile
  })

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  if (!isFamilyProfile && !profile) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => router.push('/appointments/create')}
      addNewLabel="Add Appointment"
      title={isFamilyProfile ? 'Family\'s appointments' : `${getProfileDisplayName(profile!)}'s appointments`}
      description="Past medical appointments"
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
        searchPlaceholder: 'Search appointments...',
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
            options: Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => ({ value, label })),
            selected: filters.statuses,
            onChange: statuses => setFilters(prev => ({ ...prev, page: 1, statuses }))
          }
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom !== defaultDateFrom || filters.dateTo !== defaultDateTo || filters.statuses.length > 0),
        onClearFilters: () => setFilters(() => ({ page: 1, pageSize: filters.pageSize, sortField: 'date', sortDirection: 'desc', search: '', dateFrom: null, dateTo: null, statuses: [] }))
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
  return <Suspense><AppointmentsPage /></Suspense>
}
