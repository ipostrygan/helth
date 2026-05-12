import { ColumnDef } from '@tanstack/react-table'
import type { TherapyWithUser } from '@/app/actions/therapies'
import { AppLink } from '@/components/custom/app-link'
import { RowActions } from '@/components/row-actions'
import { StatusBadge } from '@/components/custom/status-badge'
import { profileLabel } from '../users/utils/profile.utils'

interface TherapyColumnsOptions {
  onDelete: (id: string) => void
  onEdit: (id: string) => void
  isFamilyProfile?: boolean
}

export function prepareTherapyColumns({ onDelete, onEdit, isFamilyProfile }: TherapyColumnsOptions) {
  const cols: ColumnDef<TherapyWithUser>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <AppLink href={`/therapies/${row.original.id}`} className="font-medium">
          {row.getValue('title')}
        </AppLink>
      )
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => new Date(row.getValue('startDate')).toLocaleDateString()
    },
    {
      accessorKey: 'endDate',
      header: 'End Date',
      cell: ({ row }) => {
        const val = row.getValue<string | null>('endDate')
        return val ? new Date(val).toLocaleDateString() : '—'
      }
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => {
        const active = row.getValue<boolean>('isActive')
        return <StatusBadge status={active ? 'Ongoing' : 'Finished'} />
      }
    }
  ]

  if (isFamilyProfile) {
    cols.push({
      id: 'profile',
      header: 'Profile',
      cell: ({ row }) => profileLabel(row.original.user)
    })
  }

  cols.push({
    id: 'actions',
    enableSorting: false,
    cell: ({ row }) => (
      <RowActions
        onEdit={() => onEdit(row.original.id)}
        onDelete={() => onDelete(row.original.id)}
      />
    )
  })

  return cols
}
