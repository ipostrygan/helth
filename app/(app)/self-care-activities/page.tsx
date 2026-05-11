'use client'

import { Suspense, useState } from 'react'
import { type SortingState } from '@tanstack/react-table'
import type { SelfCareActivityWithUser } from '@/app/actions/self-care-activities'
import { useQueryStates } from 'nuqs'
import {
  baseFilterParsers,
  defaultDateFrom,
  defaultDateTo
} from '@/lib/search-params'
import { useActiveProfile } from '@/context/profile-context'
import { useProfile } from '../users/hooks/use-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useSelfCareActivities } from './hooks/use-self-care-activities'
import { useSelfCareActivity } from './hooks/use-self-care-activity'
import { useDeleteSelfCareActivity } from './hooks/use-delete-self-care-activity'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { TableTemplate, type SortChange } from '@/components/table-template'
import { Modal } from '@/components/custom/modal'
import { SelfCareActivityDetailsSheet } from './components/self-care-activity-details-sheet'
import SelfCareActivityForm from './self-care-activity-form'
import { prepareSelfCareActivityColumns } from './columns'

export default function Page() {
  return (
    <Suspense>
      <SelfCareActivitiesPage />
    </Suspense>
  )
}

function SelfCareActivitiesPage() {
  const [openId, setOpenId] = useState<string | null>(null)
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('date')
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteSelfCareActivity()
  const [addingItem, setAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<SelfCareActivityWithUser | null>(null)

  const { data: openActivity } = useSelfCareActivity(openId ?? '')

  const profileId = isFamilyProfile ? undefined : activeProfileId

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined
  }
  const { data, isLoading, isFetching, isError } = useSelfCareActivities(params)

  const sorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  const columns = prepareSelfCareActivityColumns({
    onOpenDetail: setOpenId,
    onEdit: setEditingItem,
    onDelete: setDeletingId
  })

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined
        }
      : undefined

  if (!isFamilyProfile && !profile) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => setAddingItem(true)}
      addNewLabel="Add activity"
      title={isFamilyProfile ? 'Family\'s self-care activities' : `${getProfileDisplayName(profile!)}'s self-care activities`}
      description="Self-care activities - taking medications, applying treatments, wellness routines"
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
      filters={{
        searchValue: filters.search,
        onSearchChange: search => setFilters(prev => ({ ...prev, page: 1, search })),
        searchPlaceholder: 'Search self-care activities...',
        dateRange,
        onDateRangeChange: (range: DateRange | undefined) =>
          setFilters(prev => ({
            ...prev,
            page: 1,
            dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : null,
            dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : null
          })),
        hasActiveFilters: !!(
          filters.search
          || filters.dateFrom !== defaultDateFrom
          || filters.dateTo !== defaultDateTo
        ),
        onClearFilters: () =>
          setFilters(() => ({
            page: 1,
            pageSize: filters.pageSize,
            sortField: 'date',
            sortDirection: 'desc',
            search: '',
            dateFrom: null,
            dateTo: null
          }))
      }}
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
              if (!open) setAddingItem(false)
            }}
            title="Add self-care activity"
            description="Fill in the details below."
          >
            <SelfCareActivityForm
              onClose={() => setAddingItem(false)}
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
                selfCareActivity={editingItem}
              />
            )}
          </Modal>
        </>
      )}
    />
  )
}
