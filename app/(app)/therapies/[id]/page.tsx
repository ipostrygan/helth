'use client'

import { Suspense, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useActiveProfile } from '@/context/profile-context'
import { useTherapy } from '../hooks/use-therapy'
import { TableTemplate, type SortChange } from '@/components/table-template'
import { useMedicalExpenses } from '../../medical-expenses/hooks/use-medical-expenses'
import { useDeleteMedicalExpense } from '../../medical-expenses/hooks/use-delete-medical-expense'
import { useAppointments } from '../../appointments/hooks/use-appointments'
import { useDeleteAppointment } from '../../appointments/hooks/use-delete-appointment'
import { SortingState } from '@tanstack/react-table'
import { prepareAppointmentColumns } from '../../appointments/columns'
import { prepareMedicalExpenseColumns } from '../../medical-expenses/columns'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { TherapyDetailsCard } from './therapy-details-card'
import { TherapyDocumentsCard } from './appointment-documents-card'
import { DetailPageSkeleton } from '@/components/custom/detail-page-skeleton'
import { formatCurrency } from '@/lib/utils'
import { useTableFilters } from '@/hooks/use-table-filters'

const TherapyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { data: therapy, isLoading } = useTherapy(id)
  const { filters, sorting, onSortingChange, onPageChange, onPageSizeChange } = useTableFilters()

  const [apptFilters, setApptFilters] = useQueryStates({
    apptPage: parseAsInteger.withDefault(1),
    apptPageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    apptSortField: parseAsString.withDefault('date'),
    apptSortDirection: parseAsString.withDefault('desc')
  })

  const { data: expensesData, isLoading: isExpensesLoading, isError: isExpensesError } = useMedicalExpenses({
    therapyId: id,
    page: filters.page,
    pageSize: filters.pageSize,
    sortField: filters.sortField,
    sortDirection: filters.sortDirection,
  }, 'therapyId')

  const { data: appointmentsData, isLoading: isAppointmentsLoading, isError: isAppointmentsError } = useAppointments({
    profileId: activeProfileId ?? undefined,
    therapyId: id,
    page: apptFilters.apptPage,
    pageSize: apptFilters.apptPageSize,
    sortField: apptFilters.apptSortField,
    sortDirection: apptFilters.apptSortDirection
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()

  const [deletingApptId, setDeletingApptId] = useState<string | null>(null)
  const { mutate: deleteAppointment, isPending: isDeletingAppt } = useDeleteAppointment()

  if (isLoading || !therapy) {
    return (
      <DetailPageSkeleton
        detailRows={5}
        tableSections={[
          { headerWidth: 'w-40', rows: 3, columns: 5 },
          { headerWidth: 'w-36', rows: 3, columns: 4 }
        ]}
      />
    )
  }

  const apptSorting: SortingState = [{ id: apptFilters.apptSortField, desc: apptFilters.apptSortDirection === 'desc' }]
  const onApptSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setApptFilters(prev => ({ ...prev, apptPage: 1, apptSortField: sortField, apptSortDirection: sortDirection }))
  }

  const apptColumns = prepareAppointmentColumns({
    onDelete: id => setDeletingApptId(id)
  })

  const columns = prepareMedicalExpenseColumns({
    onDelete: id => setDeletingId(id)
  })

  return (
    <div className="sm:px-6 sm:pt-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: 'Therapies', href: '/therapies' }, { label: therapy.title }]} />
        <h1 className="text-2xl font-semibold">{therapy.title}</h1>
      </div>

      <TherapyDetailsCard therapy={therapy} id={id} />

      <TherapyDocumentsCard therapyId={id} />

      <TableTemplate
        className="space-y-4"
        title="Related Appointments"
        columns={apptColumns}
        data={appointmentsData}
        isLoading={isAppointmentsLoading}
        isError={isAppointmentsError}
        pageSize={apptFilters.apptPageSize}
        onPageChange={page => setApptFilters(prev => ({ ...prev, apptPage: page }))}
        onPageSizeChange={pageSize => setApptFilters(prev => ({ ...prev, apptPage: 1, apptPageSize: pageSize }))}
        sorting={apptSorting}
        onSortingChange={onApptSortingChange}
        onAddNew={() => router.push(`/appointments/create?therapyId=${id}`)}
        addNewLabel="Add appointment"
        deleteConfig={{
          deletingId: deletingApptId,
          onCancel: () => setDeletingApptId(null),
          onConfirm: () => {
            if (deletingApptId === null) return
            deleteAppointment(deletingApptId, { onSuccess: () => setDeletingApptId(null) })
          },
          isPending: isDeletingAppt
        }}
      />

      <TableTemplate
        className="space-y-4"
        title="Medical Expenses"
        description={`Total sum of expenses: ${formatCurrency(expensesData?.totalSum ?? 0)}`}
        columns={columns}
        data={expensesData}
        isLoading={isExpensesLoading}
        isError={isExpensesError}
        pageSize={filters.pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        sorting={sorting}
        onSortingChange={onSortingChange}
        deleteConfig={{
          deletingId,
          onCancel: () => setDeletingId(null),
          onConfirm: () => {
            if (deletingId === null) return
            deleteExpense(deletingId, { onSuccess: () => setDeletingId(null) })
          },
          isPending: isDeleting
        }}
      />
    </div>
  )
}

export default function Page() {
  return <Suspense><TherapyDetailPage /></Suspense>
}
