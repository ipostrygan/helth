'use client'

import { Suspense, useState } from 'react'
import type { SelfCareActivityWithUser } from '@/app/actions/self-care-activities'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useSelfCareActivities } from './hooks/use-self-care-activities'
import { useSelfCareActivity } from './hooks/use-self-care-activity'
import { useDeleteSelfCareActivity } from './hooks/use-delete-self-care-activity'
import { useCreateSelfCareActivity } from './hooks/use-create-self-care-activity'
import { useEditSelfCareActivity } from './hooks/use-edit-self-care-activity'
import { TableTemplate } from '@/components/table-template'
import { useTableFilters } from '@/hooks/use-table-filters'
import { Modal } from '@/components/custom/modal'
import { FamilyMemberSelect } from '@/components/custom/family-member-select'
import { SelfCareActivityDetailsSheet } from './components/self-care-activity-details-sheet'
import SelfCareActivityForm from './self-care-activity-form'
import { prepareSelfCareActivityColumns } from './columns'
import { usePageProfile } from '@/hooks/use-page-profile'

export default function Page() {
  return (
    <Suspense>
      <SelfCareActivitiesPage />
    </Suspense>
  )
}

function SelfCareActivitiesPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const { activeProfileId, isFamilyProfile, profile, profileId, isReady }
    = usePageProfile()

  const {
    filters,
    filtersConfig,
    sorting,
    onSortingChange,
    onPageChange,
    onPageSizeChange
  } = useTableFilters({
    searchPlaceholder: 'Search self-care activities...'
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting }
    = useDeleteSelfCareActivity()
  const { mutateAsync: createItem } = useCreateSelfCareActivity()
  const { mutateAsync: editItem } = useEditSelfCareActivity()
  const [addingItem, setAddingItem] = useState(false)
  const [addingItemUserId, setAddingItemUserId] = useState<string | null>(null)
  const [editingItem, setEditingItem]
    = useState<SelfCareActivityWithUser | null>(null)

  const { data: openActivity } = useSelfCareActivity(openId ?? '')

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined
  }
  const { data, isLoading, isFetching, isError }
    = useSelfCareActivities(params)

  const clearAddingItem = () => {
    setAddingItem(false)
    setAddingItemUserId(null)
  }

  const columns = prepareSelfCareActivityColumns({
    onOpenDetail: setOpenId,
    onEdit: setEditingItem,
    onDelete: setDeletingId,
    isFamilyProfile
  })

  if (!isReady) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => setAddingItem(true)}
      addNewLabel="Add activity"
      title={
        isFamilyProfile
          ? 'Family\'s self-care activities'
          : `${getProfileDisplayName(profile!)}'s self-care activities`
      }
      description="Self-care activities - taking medications, applying treatments, wellness routines"
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
      filters={filtersConfig}
      deleteConfig={{
        deletingId,
        onCancel: () => setDeletingId(null),
        onConfirm: () => {
          if (deletingId === null) return
          deleteItem(deletingId, { onSuccess: () => setDeletingId(null) })
        },
        isPending: isDeleting
      }}
      modals={(
        <>
          <SelfCareActivityDetailsSheet
            selfCareActivity={openActivity ?? null}
            open={!!openId && !!openActivity}
            onOpenChange={(open) => {
              if (!open) setOpenId(null)
            }}
          />
          <Modal
            open={addingItem}
            onOpenChange={(open) => {
              if (!open) clearAddingItem()
            }}
            title="Add self-care activity"
            description="Fill in the details below."
          >
            {isFamilyProfile && (
              <FamilyMemberSelect
                value={addingItemUserId}
                onChange={setAddingItemUserId}
              />
            )}
            <SelfCareActivityForm
              onClose={clearAddingItem}
              onSubmit={async (values) => {
                await createItem({
                  ...values,
                  userId: (isFamilyProfile
                    ? addingItemUserId
                    : activeProfileId)!
                })
                clearAddingItem()
              }}
              isSubmitDisabled={isFamilyProfile && !addingItemUserId}
            />
          </Modal>
          <Modal
            open={editingItem !== null}
            onOpenChange={(open) => {
              if (!open) setEditingItem(null)
            }}
            title="Edit self-care activity"
            description="Update the details of the selected self-care activity."
          >
            {editingItem && (
              <SelfCareActivityForm
                onClose={() => setEditingItem(null)}
                onSubmit={async (values) => {
                  await editItem({ id: editingItem.id, ...values })
                  setEditingItem(null)
                }}
                selfCareActivity={editingItem}
              />
            )}
          </Modal>
        </>
      )}
    />
  )
}
