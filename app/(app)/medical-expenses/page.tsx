'use client'

import { Suspense, useState } from 'react'
import type { MedicalExpense } from '@/lib/generated/prisma'
import { usePageProfile } from '@/hooks/use-page-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useMedicalExpenses } from './hooks/use-medical-expenses'
import { useDeleteMedicalExpense } from './hooks/use-delete-medical-expense'
import { useCreateMedicalExpense } from './hooks/use-create-medical-expense'
import { useEditMedicalExpense } from './hooks/use-edit-medical-expense'
import type { ExpenseType } from '@/lib/generated/prisma'
import type { MedicalExpensesQueryParams } from './types'
import { EXPENSE_TYPE_LABELS } from './constants'
import { formatCurrency } from '@/lib/utils'
import { Modal } from '@/components/custom/modal'
import { FamilyMemberSelect } from '@/components/custom/family-member-select'
import { prepareMedicalExpenseColumns } from './columns'
import { TableTemplate } from '@/components/table-template'
import { useTableFilters } from '@/hooks/use-table-filters'
import MedicalExpenseForm from './medical-expense-form'
import { MedicalExpenseDetailsSheet } from './components/medical-expense-details-sheet'

const TYPE_OPTIONS = Object.entries(EXPENSE_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

const MedicalExpensesPage = () => {
  const { activeProfileId, isFamilyProfile, profile, profileId, isReady }
    = usePageProfile()

  const {
    filters,
    extraFilters,
    filtersConfig,
    sorting,
    onSortingChange,
    onPageChange,
    onPageSizeChange
  } = useTableFilters({
    searchPlaceholder: 'Search expenses...',
    filterGroups: [{ key: 'types', label: 'Type', options: TYPE_OPTIONS }]
  })

  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(
    null
  )
  const { mutate: deleteExpense, isPending: isDeleting }
    = useDeleteMedicalExpense()
  const { mutateAsync: createExpense } = useCreateMedicalExpense()
  const { mutateAsync: editExpense } = useEditMedicalExpense()
  const [addingExpense, setAddingExpense] = useState(false)
  const [addingExpenseUserId, setAddingExpenseUserId] = useState<string | null>(
    null
  )
  const [editingExpense, setEditingExpense] = useState<MedicalExpense | null>(
    null
  )
  const [viewingExpense, setViewingExpense] = useState<MedicalExpense | null>(
    null
  )

  const params: MedicalExpensesQueryParams = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    types: (extraFilters['types'] ?? []) as ExpenseType[]
  }
  const { data, isLoading, isFetching, isError } = useMedicalExpenses(
    params,
    'profileId'
  )

  const clearAddingExpense = () => {
    setAddingExpense(false)
    setAddingExpenseUserId(null)
  }

  const columns = prepareMedicalExpenseColumns({
    onView: setViewingExpense,
    onEdit: setEditingExpense,
    onDelete: setDeletingExpenseId,
    isFamilyProfile
  })

  if (!isReady) {
    return null
  }

  const totalSum = data?.totalSum ?? 0
  const description = `Total sum of expenses for selected period: ${formatCurrency(totalSum)}`

  return (
    <TableTemplate
      title={
        isFamilyProfile
          ? 'Family\'s medical expenses'
          : `${getProfileDisplayName(profile!)}'s medical expenses`
      }
      description={description}
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      pageSize={filters.pageSize}
      onPageChange={onPageChange}
      onPageSizeChange={onPageSizeChange}
      sorting={sorting}
      onSortingChange={onSortingChange}
      onAddNew={() => setAddingExpense(true)}
      filters={filtersConfig}
      deleteConfig={{
        deletingId: deletingExpenseId,
        onCancel: () => setDeletingExpenseId(null),
        onConfirm: () => {
          if (deletingExpenseId === null) return
          deleteExpense(deletingExpenseId, {
            onSuccess: () => setDeletingExpenseId(null)
          })
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
              if (!open) clearAddingExpense()
            }}
            title="Add medical expense"
            description="Fill in the details below to record a new medical expense."
          >
            {isFamilyProfile && (
              <FamilyMemberSelect
                value={addingExpenseUserId}
                onChange={setAddingExpenseUserId}
              />
            )}
            <MedicalExpenseForm
              onClose={clearAddingExpense}
              onSubmit={async (values) => {
                await createExpense({
                  ...values,
                  userId: (isFamilyProfile
                    ? addingExpenseUserId
                    : activeProfileId)!
                })
                clearAddingExpense()
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
