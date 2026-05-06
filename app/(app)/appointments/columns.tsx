import { ColumnDef } from '@tanstack/react-table'
import type { AppointmentWithUser } from '@/app/actions/appointments'
import { AppLink } from '@/components/custom/app-link'
import { RowActions } from '@/components/row-actions'
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from './constants'
import { StatusBadge } from '@/components/custom/status-badge'
import type { ProfileSummary } from '@/types'

function profileLabel(user: ProfileSummary): string {
  return user.profileType === 'Human'
    ? (user.firstName ?? '')
    : (user.shortName ?? '')
}

interface AppointmentColumnsOptions {
  onDelete: (id: string) => void
  onEdit?: (id: string) => void
  showCost?: boolean
}

export function appointmentColumns({ onDelete, onEdit, showCost }: AppointmentColumnsOptions) {
  const cols: ColumnDef<AppointmentWithUser>[] = [
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
        return <StatusBadge status={status} label={APPOINTMENT_STATUS_LABELS[status]} />
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
    id: 'profile',
    header: 'Profile',
    cell: ({ row }) => profileLabel(row.original.user)
  })

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
