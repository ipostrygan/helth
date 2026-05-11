'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { Pencil } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { useActiveProfile } from '@/context/profile-context'
import { useTherapy } from '../hooks/use-therapy'
import { Separator } from '@/components/ui/separator'
import { DetailRow } from '@/components/custom/detail-row'
import { TableTemplate, type SortChange } from '@/components/table-template'
import { useMedicalExpenses } from '../../medical-expenses/hooks/use-medical-expenses'
import { useDeleteMedicalExpense } from '../../medical-expenses/hooks/use-delete-medical-expense'
import { useAppointments } from '../../appointments/hooks/use-appointments'
import { useDeleteAppointment } from '../../appointments/hooks/use-delete-appointment'
import { SortingState } from '@tanstack/react-table'
import { AppLink } from '@/components/custom/app-link'
import { prepareAppointmentColumns } from '../../appointments/columns'
import { prepareMedicalExpenseColumns } from '../../medical-expenses/columns'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/custom/status-badge'
import { DocumentsCard } from '@/components/documents-card'
import { useDocuments } from '@/app/(app)/hooks/use-documents'
import { queryKeys } from '@/lib/query-keys'
import { DetailPageSkeleton } from '@/components/custom/detail-page-skeleton'

const TherapyDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { data: therapy, isLoading } = useTherapy(id)
  const { uploadMutation, removeMutation } = useDocuments(`/api/therapies/${id}/documents`, queryKeys.therapies.detail(id))

  const [filters, setFilters] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    sortField: parseAsString.withDefault('date'),
    sortDirection: parseAsString.withDefault('desc')
  })

  const [apptFilters, setApptFilters] = useQueryStates({
    apptPage: parseAsInteger.withDefault(1),
    apptPageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    apptSortField: parseAsString.withDefault('date'),
    apptSortDirection: parseAsString.withDefault('desc')
  })

  const { data: expensesData, isLoading: isExpensesLoading, isError: isExpensesError } = useMedicalExpenses({
    therapyId: id,
    ...filters
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
          { headerWidth: 'w-36', rows: 3, columns: 4 },
        ]}
      />
    )
  }

  const expenseSorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onExpenseSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
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

      <Card>
        <CardHeader className="border-b gap-0 items-center">
          <CardTitle className="text-base">Details</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/therapies/${id}/edit`}>
              <Pencil className="size-4 mr-1" />
              Edit
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Status">
            <StatusBadge status={therapy.isActive ? 'Ongoing' : 'Finished'} />
          </DetailRow>
          <Separator />
          <DetailRow label="Start Date">
            {new Date(therapy.startDate).toLocaleDateString()}
          </DetailRow>
          <Separator />
          <DetailRow label="End Date">
            {therapy.endDate ? new Date(therapy.endDate).toLocaleDateString() : '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {therapy.description ?? '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Specialists">
            {therapy.specialists.length === 0
              ? '—'
              : (
                  <div className="space-y-1">
                    {therapy.specialists.map(s =>
                      s.link
                        ? (
                            <div key={s.name}>
                              <AppLink href={s.link} external className="font-medium">
                                {s.name}
                              </AppLink>
                            </div>
                          )
                        : (
                            <div key={s.name}>{s.name}</div>
                          )
                    )}
                  </div>
                )}
          </DetailRow>
        </CardContent>
      </Card>

      <DocumentsCard documents={therapy.documents ?? []} uploadMutation={uploadMutation} removeMutation={removeMutation} />

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
        description={`Total sum of expenses: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(expensesData?.totalSum ?? 0)}`}
        columns={columns}
        data={expensesData}
        isLoading={isExpensesLoading}
        isError={isExpensesError}
        pageSize={filters.pageSize}
        onPageChange={page => setFilters(prev => ({ ...prev, page }))}
        onPageSizeChange={pageSize => setFilters(prev => ({ ...prev, page: 1, pageSize }))}
        sorting={expenseSorting}
        onSortingChange={onExpenseSortingChange}
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
