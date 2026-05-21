'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePageProfile } from '@/hooks/use-page-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useAppointments } from './hooks/use-appointments'
import { useDeleteAppointment } from './hooks/use-delete-appointment'
import { AppointmentStatus, AppointmentType } from '@/lib/generated/prisma'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from './constants'
import { prepareAppointmentColumns } from './columns'
import { TableTemplate } from '@/components/table-template'
import { useTableFilters } from '@/hooks/use-table-filters'

const STATUS_OPTIONS = Object.entries(APPOINTMENT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
)

const TYPE_OPTIONS = Object.entries(APPOINTMENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

const AppointmentsPage = () => {
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
    searchPlaceholder: 'Search appointments...',
    filterGroups: [
      { key: 'statuses', label: 'Status', options: STATUS_OPTIONS },
      { key: 'types', label: 'Type', options: TYPE_OPTIONS }
    ]
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteAppointment()

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    statuses: (extraFilters['statuses'] ?? []) as AppointmentStatus[],
    types: (extraFilters['types'] ?? []) as AppointmentType[]
  }
  const { data, isLoading, isFetching, isError } = useAppointments(params)

  const columns = prepareAppointmentColumns({
    showCost: true,
    onEdit: id => router.push(`/appointments/${id}/edit`),
    onDelete: id => setDeletingId(id),
    isFamilyProfile
  })

  if (!isReady) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => router.push('/appointments/create')}
      addNewLabel="Add Appointment"
      title={
        isFamilyProfile
          ? 'Family\'s appointments'
          : `${getProfileDisplayName(profile!)}'s appointments`
      }
      description="Past medical appointments"
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
      <AppointmentsPage />
    </Suspense>
  )
}
