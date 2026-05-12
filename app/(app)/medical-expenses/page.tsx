'use client'

import { Suspense, useState } from 'react'
import { SortingState } from '@tanstack/react-table'
import type { MedicalExpense } from '@/lib/generated/prisma'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import {
  baseFilterParsers,
  defaultDateFrom,
  defaultDateTo
} from '@/lib/search-params'
import { usePageProfile } from '../hooks/use-page-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useMedicalExpenses } from './hooks/use-medical-expenses'
import { useDeleteMedicalExpense } from './hooks/use-delete-medical-expense'
import { useCreateMedicalExpense } from './hooks/use-create-medical-expense'
import { useEditMedicalExpense } from './hooks/use-edit-medical-expense'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import type { ExpenseType } from '@/lib/generated/prisma'
import type { MedicalExpensesQueryParams } from './types'
import { EXPENSE_TYPE_LABELS } from './constants'
import { formatCurrency } from '@/lib/utils'
import { Modal } from '@/components/custom/modal'
import { FamilyMemberSelect } from '@/components/custom/family-member-select'
import { prepareMedicalExpenseColumns } from './columns'
import { TableTemplate, type SortChange } from '@/components/table-template'
import MedicalExpenseForm from './medical-expense-form'
import { MedicalExpenseDetailsSheet } from './components/medical-expense-details-sheet'

const MedicalExpensesPage = () => {
  const { activeProfileId, isFamilyProfile, profile, profileId, isReady } = usePageProfile()
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('date'),
    types: parseAsArrayOf(parseAsString).withDefault([])
  })

  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()
  const { mutateAsync: createExpense } = useCreateMedicalExpense()
  const { mutateAsync: editExpense } = useEditMedicalExpense()
  const [addingExpense, setAddingExpense] = useState(false)
  const [addingExpenseUserId, setAddingExpenseUserId] = useState<string | null>(null)
  const [editingExpense, setEditingExpense] = useState<MedicalExpense | null>(null)
  const [viewingExpense, setViewingExpense] = useState<MedicalExpense | null>(null)

  const params: MedicalExpensesQueryParams = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    types: filters.types as ExpenseType[]
  }
  const { data, isLoading, isFetching, isError } = useMedicalExpenses(params, 'profileId')

  const sorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  const columns = prepareMedicalExpenseColumns({
    onView: setViewingExpense,
    onEdit: setEditingExpense,
    onDelete: setDeletingExpenseId,
    isFamilyProfile
  })

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined
        }
      : undefined

  if (!isReady) {
    return null
  }

  const totalSum = data?.totalSum ?? 0
  const description = `Total sum of expenses for selected period: ${formatCurrency(totalSum)}`

  return (
    <TableTemplate
      title={isFamilyProfile ? 'Family\'s medical expenses' : `${getProfileDisplayName(profile!)}'s medical expenses`}
      description={description}
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      pageSize={filters.pageSize}
      onPageChange={page => setFilters(prev => ({ ...prev, page }))}
      onPageSizeChange={pageSize => setFilters(prev => ({ ...prev, page: 1, pageSize }))}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onAddNew={() => setAddingExpense(true)}
      filters={{
        searchValue: filters.search,
        onSearchChange: search => setFilters(prev => ({ ...prev, page: 1, search })),
        searchPlaceholder: 'Search expenses...',
        dateRange,
        onDateRangeChange: (range: DateRange | undefined) =>
          setFilters(prev => ({
            ...prev,
            page: 1,
            dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : null
          })),
        filterGroups: [
          {
            label: 'Type',
            options: Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            selected: filters.types,
            onChange: types => setFilters(prev => ({ ...prev, page: 1, types }))
          }
        ],
        hasActiveFilters: !!(
          filters.search
          || filters.dateFrom !== defaultDateFrom
          || filters.dateTo !== defaultDateTo
          || filters.types.length > 0
        ),
        onClearFilters: () =>
          setFilters(() => ({
            page: 1,
            pageSize: filters.pageSize,
            sortField: 'date',
            sortDirection: 'desc',
            search: '',
            dateFrom: null,
            dateTo: null,
            types: []
          }))
      }}
      deleteConfig={{
        deletingId: deletingExpenseId,
        onCancel: () => setDeletingExpenseId(null),
        onConfirm: () => {
          if (deletingExpenseId === null) return
          deleteExpense(deletingExpenseId, { onSuccess: () => setDeletingExpenseId(null) })
        },
        isPending: isDeleting
      }}
      modals={(
        <>
          <MedicalExpenseDetailsSheet
            expense={viewingExpense}
            open={viewingExpense !== null}
            onOpenChange={(open) => {
              if (!open) setViewingExpense(null)
            }}
          />

          <Modal
            open={addingExpense}
            onOpenChange={(open) => {
              if (!open) {
                setAddingExpense(false)
                setAddingExpenseUserId(null)
              }
            }}
            title="Add medical expense"
            description="Fill in the details below to record a new medical expense."
          >
            {isFamilyProfile && (
              <FamilyMemberSelect value={addingExpenseUserId} onChange={setAddingExpenseUserId} />
            )}
            <MedicalExpenseForm
              onClose={() => {
                setAddingExpense(false)
                setAddingExpenseUserId(null)
              }}
              onSubmit={async (values) => {
                await createExpense({ ...values, userId: (isFamilyProfile ? addingExpenseUserId : activeProfileId)! })
                setAddingExpense(false)
                setAddingExpenseUserId(null)
              }}
              isSubmitDisabled={isFamilyProfile && !addingExpenseUserId}
            />
          </Modal>

          <Modal
            open={editingExpense !== null}
            onOpenChange={(open) => {
              if (!open) setEditingExpense(null)
            }}
            title="Edit medical expense"
            description="Update the details of the selected medical expense."
          >
            {editingExpense && (
              <MedicalExpenseForm
                onClose={() => setEditingExpense(null)}
                onSubmit={async (values) => {
                  await editExpense({ id: editingExpense.id, ...values })
                  setEditingExpense(null)
                }}
                expense={editingExpense}
              />
            )}
          </Modal>
        </>
      )}
    />
  )
}

export default function Page() {
  return (
    <Suspense>
      <MedicalExpensesPage />
    </Suspense>
  )
}
