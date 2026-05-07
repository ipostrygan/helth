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
import { useActiveProfile } from '@/context/profile-context'
import { useProfile } from '../users/hooks/use-profile'
import { getProfileDisplayName } from '../users/types/profile.types'
import { useMedicalExpenses } from './hooks/use-medical-expenses'
import { useDeleteMedicalExpense } from './hooks/use-delete-medical-expense'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { EXPENSE_TYPE_LABELS } from './constants'
import { Modal } from '@/components/custom/modal'
import { medicalExpenseColumns } from './columns'
import { TableTemplate, type SortChange } from '@/components/table-template'
import MedicalExpenseForm from './medical-expense-form'
import { MedicalExpenseDetailsSheet } from './components/medical-expense-details-sheet'

const MedicalExpensesPage = () => {
  const { activeProfileId, isFamilyProfile, isProfileReady } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('date'),
    types: parseAsArrayOf(parseAsString).withDefault([])
  })

  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()
  const [addingExpense, setAddingExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<MedicalExpense | null>(null)
  const [viewingExpense, setViewingExpense] = useState<MedicalExpense | null>(null)

  const profileId = isProfileReady ? (isFamilyProfile ? undefined : activeProfileId) : null

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    types: filters.types
  }
  const { data, isLoading, isFetching, isError } = useMedicalExpenses(params, 'profileId')

  const sorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  const columns = medicalExpenseColumns({
    onView: setViewingExpense,
    onEdit: setEditingExpense,
    onDelete: setDeletingExpenseId
  })

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined
        }
      : undefined

  if (!isProfileReady) {
    return null
  }

  const totalSum = data?.totalSum ?? 0
  const description = `Total sum of expenses for selected period: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(totalSum)}`

  return (
    <TableTemplate
      title={isFamilyProfile ? "Family's medical expenses" : `${getProfileDisplayName(profile!)}'s medical expenses`}
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
              if (!open) setAddingExpense(false)
            }}
            title="Add medical expense"
            description="Fill in the details below to record a new medical expense."
          >
            <MedicalExpenseForm
              profileId={activeProfileId!}
              onClose={() => setAddingExpense(false)}
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
                profileId={activeProfileId!}
                onClose={() => setEditingExpense(null)}
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
