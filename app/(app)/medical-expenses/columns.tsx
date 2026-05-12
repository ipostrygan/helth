import { ColumnDef } from '@tanstack/react-table'
import type { MedicalExpenseWithUser } from '@/app/actions/medical-expenses'
import { RowActions } from '@/components/row-actions'
import { formatCurrency } from '@/lib/utils'
import { EXPENSE_TYPE_LABELS } from './constants'
import { profileLabel } from '../users/utils/profile.utils'

interface MedicalExpenseColumnsOptions {
  onDelete: (id: string) => void
  onEdit?: (expense: MedicalExpenseWithUser) => void
  onView?: (expense: MedicalExpenseWithUser) => void
  isFamilyProfile?: boolean
}

export function prepareMedicalExpenseColumns({ onDelete, onEdit, onView, isFamilyProfile }: MedicalExpenseColumnsOptions) {
  const cols: ColumnDef<MedicalExpenseWithUser>[] = [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) =>
        onView
          ? (
              <button
                className="text-primary font-medium hover:text-primary/80 transition-colors text-left"
                onClick={() => onView(row.original)}
              >
                {row.getValue('title')}
              </button>
            )
          : row.getValue('title')
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) =>
        formatCurrency(row.getValue('amount'))
    },
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString()
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => EXPENSE_TYPE_LABELS[row.getValue<keyof typeof EXPENSE_TYPE_LABELS>('type')]
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
        onEdit={onEdit ? () => onEdit(row.original) : undefined}
        onDelete={() => onDelete(row.original.id)}
      />
    )
  })

  return cols
}
