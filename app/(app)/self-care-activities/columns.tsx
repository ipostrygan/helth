import { ColumnDef } from '@tanstack/react-table'
import type { SelfCareActivityWithUser } from '@/app/actions/self-care-activities'
import { RowActions } from '@/components/row-actions'
import type { ProfileSummary } from '@/types'

function profileLabel(user: ProfileSummary): string {
  return user.profileType === 'Human'
    ? (user.firstName ?? '')
    : (user.shortName ?? '')
}

interface SelfCareActivityColumnsOptions {
  onOpenDetail: (id: string) => void
  onEdit: (item: SelfCareActivityWithUser) => void
  onDelete: (id: string) => void
}

export function prepareSelfCareActivityColumns({
  onOpenDetail,
  onEdit,
  onDelete
}: SelfCareActivityColumnsOptions): ColumnDef<SelfCareActivityWithUser>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:text-primary/80 transition-colors text-left"
          onClick={() => onOpenDetail(row.original.id)}
        >
          {row.original.title}
        </button>
      )
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.original.date).toLocaleDateString()
    },
    {
      accessorKey: 'medication',
      header: 'Medication',
      cell: ({ row }) => row.original.medication
    },
    {
      accessorKey: 'dosage',
      header: 'Dosage',
      enableSorting: false,
      cell: ({ row }) => row.original.dosage
    },
    {
      id: 'profile',
      header: 'Profile',
      cell: ({ row }) => profileLabel(row.original.user)
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => onEdit(row.original)}
          onDelete={() => onDelete(row.original.id)}
        />
      )
    }
  ]
}
