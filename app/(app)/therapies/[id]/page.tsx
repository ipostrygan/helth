'use client'

import { Suspense, use, useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { useTherapy } from '../hooks/use-therapy'
import { Separator } from '@/components/ui/separator'
import { TableTemplate } from '@/components/table-template'
import { useMedicalExpenses } from '../../medical-expenses/hooks/use-medical-expenses'
import { useDeleteMedicalExpense } from '../../medical-expenses/hooks/use-delete-medical-expense'
import { useAppointments } from '../../appointments/hooks/use-appointments'
import { useDeleteAppointment } from '../../appointments/hooks/use-delete-appointment'
import { ColumnDef } from '@tanstack/react-table'
import type { MedicalExpense, Appointment } from '@/lib/generated/prisma/client'
import { SortButton } from '@/components/ui/sort-button'
import { EXPENSE_TYPE_LABELS } from '../../medical-expenses/constants'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from '../../appointments/constants'
import { RowActions } from '@/components/row-actions'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { DocumentsCard } from '@/components/documents-card'
import { useDocuments } from '@/app/(app)/hooks/use-documents'
import { queryKeys } from '@/lib/query-keys'

type TherapyDetailPageProps = {
  params: Promise<{ id: string }>
}

const TherapyDetailPage = ({ params }: TherapyDetailPageProps) => {
  const { id } = use(params)
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

  const { data: expensesData, isLoading: isExpensesLoading } = useMedicalExpenses({
    therapyId: id,
    ...filters
  })

  const { data: appointmentsData, isLoading: isAppointmentsLoading } = useAppointments({
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

  if (isLoading) return null
  if (!therapy) return null

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === 'asc' ? 'desc' : 'asc'
    setFilters(prev => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
  }

  const onApptSortChange = (field: string) => {
    const direction = apptFilters.apptSortField === field && apptFilters.apptSortDirection === 'asc' ? 'desc' : 'asc'
    setApptFilters(prev => ({ ...prev, apptPage: 1, apptSortField: field, apptSortDirection: direction }))
  }

  const apptColumns: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'title',
      header: () => <SortButton field="title" label="Title" sortField={apptFilters.apptSortField} sortDirection={apptFilters.apptSortDirection} onSortChange={onApptSortChange} />
    },
    {
      accessorKey: 'date',
      header: () => <SortButton field="date" label="Date" sortField={apptFilters.apptSortField} sortDirection={apptFilters.apptSortDirection} onSortChange={onApptSortChange} />,
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString()
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => APPOINTMENT_TYPE_LABELS[row.getValue('type') as keyof typeof APPOINTMENT_TYPE_LABELS]
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => APPOINTMENT_STATUS_LABELS[row.getValue('status') as keyof typeof APPOINTMENT_STATUS_LABELS]
    },
    {
      accessorKey: 'doctorName',
      header: 'Doctor',
      cell: ({ row }) => row.getValue('doctorName') ?? '—'
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActions onDelete={() => setDeletingApptId(row.original.id)} />
      )
    }
  ]

  const columns: ColumnDef<MedicalExpense>[] = [
    {
      accessorKey: 'title',
      header: () => <SortButton field="title" label="Title" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />
    },
    {
      accessorKey: 'amount',
      header: () => <SortButton field="amount" label="Amount" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(row.getValue('amount'))
    },
    {
      accessorKey: 'date',
      header: () => <SortButton field="date" label="Date" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString()
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => EXPENSE_TYPE_LABELS[row.getValue('type') as keyof typeof EXPENSE_TYPE_LABELS]
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.getValue('description') ?? '—'
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <RowActions
          onDelete={() => setDeletingId(row.original.id)}
        />
      )
    }
  ]

  return (
    <div className="sm:px-6 sm:pt-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: 'Therapies', href: '/therapies' }, { label: therapy.title }]} />
        <h1 className="text-2xl font-semibold">{therapy.title}</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="text-base font-semibold">Details</h2>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/therapies/${id}/edit`}>
              <Pencil className="size-4 mr-1" />
              Edit
            </Link>
          </Button>
        </div>
        <div className="px-6 py-4 space-y-4">
          <DetailRow label="Status">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                therapy.isActive
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
              }`}
            >
              {therapy.isActive ? 'Ongoing' : 'Finished'}
            </span>
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
          <DetailRow label="Therapist">
            {therapy.therapistName
              ? (
                  therapy.therapistInfoLink
                    ? (
                        <a
                          href={therapy.therapistInfoLink}
                          target={therapy.therapistInfoLink.startsWith('http') ? '_blank' : undefined}
                          rel={therapy.therapistInfoLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="underline hover:no-underline"
                        >
                          {therapy.therapistName}
                        </a>
                      )
                    : (
                        therapy.therapistName
                      )
                )
              : (
                  '—'
                )}
          </DetailRow>
          <Separator />
          <DetailRow label="Location">
            {therapy.location ?? '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {therapy.description ?? '—'}
          </DetailRow>
        </div>
      </div>

      <DocumentsCard documents={therapy.documents ?? []} uploadMutation={uploadMutation} removeMutation={removeMutation} />

      <TableTemplate
        className="space-y-4"
        title="Related Appointments"
        columns={apptColumns}
        data={appointmentsData}
        isLoading={isAppointmentsLoading}
        pageSize={apptFilters.apptPageSize}
        onPageChange={page => setApptFilters(prev => ({ ...prev, apptPage: page }))}
        onPageSizeChange={pageSize => setApptFilters(prev => ({ ...prev, apptPage: 1, apptPageSize: pageSize }))}
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
        pageSize={filters.pageSize}
        onPageChange={page => setFilters(prev => ({ ...prev, page }))}
        onPageSizeChange={pageSize => setFilters(prev => ({ ...prev, page: 1, pageSize }))}
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

const DetailRow = ({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-0">
    <span className="text-sm text-muted-foreground sm:w-48 shrink-0">{label}</span>
    <span className="text-sm">{children}</span>
  </div>
)

export default function Page(props: TherapyDetailPageProps) {
  return <Suspense><TherapyDetailPage {...props} /></Suspense>
}
