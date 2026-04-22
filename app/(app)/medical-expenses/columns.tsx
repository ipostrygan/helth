import { ColumnDef } from '@tanstack/react-table'
import type { MedicalExpense } from '@/lib/generated/prisma'
import { RowActions } from '@/components/row-actions'
import { EXPENSE_TYPE_LABELS } from './constants'

interface MedicalExpenseColumnsOptions {
  onDelete: (id: string) => void
  onEdit?: (expense: MedicalExpense) => void
  onView?: (expense: MedicalExpense) => void
}

export function medicalExpenseColumns({ onDelete, onEdit, onView }: MedicalExpenseColumnsOptions): ColumnDef<MedicalExpense>[] {
  return [
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
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(row.getValue('amount'))
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
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <RowActions
          onEdit={onEdit ? () => onEdit(row.original) : undefined}
          onDelete={() => onDelete(row.original.id)}
        />
      )
    }
  ]
}
