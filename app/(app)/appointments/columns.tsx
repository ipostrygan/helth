import { ColumnDef } from '@tanstack/react-table'
import type { Appointment } from '@/lib/generated/prisma/client'
import { AppLink } from '@/components/ui/app-link'
import { RowActions } from '@/components/row-actions'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from './constants'

interface AppointmentColumnsOptions {
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
  showCost?: boolean
}

export function appointmentColumns({ onDelete, onEdit, showCost }: AppointmentColumnsOptions) {
  const cols: ColumnDef<Appointment>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <AppLink href={`/appointments/${row.original.id}`} className="font-medium">
          {row.getValue('title')}
        </AppLink>
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString()
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => APPOINTMENT_TYPE_LABELS[row.getValue<keyof typeof APPOINTMENT_TYPE_LABELS>('type')]
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue<keyof typeof APPOINTMENT_STATUS_LABELS>('status')
        const label = APPOINTMENT_STATUS_LABELS[status]
        const isScheduled = status === 'Scheduled'
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              isScheduled
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
            }`}
          >
            {label}
          </span>
        )
      }
    },
    {
      accessorKey: 'specialistName',
      header: 'Specialist',
      cell: ({ row }) => row.getValue('specialistName') ?? '—'
    }
  ]

  if (showCost) {
    cols.push({
      accessorKey: 'cost',
      header: 'Cost (€)',
      cell: ({ row }) => row.getValue('cost') ?? '—'
    })
  }

  cols.push({
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => (
      <RowActions
        onEdit={onEdit ? () => onEdit(row.original.id) : undefined}
        onDelete={() => onDelete(row.original.id)}
      />
    )
  })

  return cols
}
