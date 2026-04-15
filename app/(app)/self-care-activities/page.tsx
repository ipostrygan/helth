'use client'

import { useState } from 'react'
import { ColumnDef } from '@tanstack/react-table'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { useQueryStates } from 'nuqs'
import {
  baseFilterParsers,
  defaultDateFrom,
  defaultDateTo
} from '@/lib/search-params'
import { useActiveProfile } from '@/context/profile-context'
import { useProfile } from '../users/hooks/use-profile'
import { useSelfCareActivities } from './hooks/use-self-care-activities'
import { useSelfCareActivity } from './hooks/use-self-care-activity'
import { useDeleteSelfCareActivity } from './hooks/use-delete-self-care-activity'
import { SortButton } from '@/components/ui/sort-button'
import { type DateRange } from 'react-day-picker'
import { format } from 'date-fns'
import { MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { TableTemplate } from '@/components/table-template'
import { Modal } from '@/components/ui/modal'
import { SelfCareActivityDetailsSheet } from './components/self-care-activity-details-sheet'
import SelfCareActivityForm from './self-care-activity-form'

export default function Page() {
  const [openId, setOpenId] = useState<string | null>(null)
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('date')
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting }
    = useDeleteSelfCareActivity()
  const [addingItem, setAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<SelfCareActivity | null>(null)

  const { data: openActivity } = useSelfCareActivity(openId ?? '')

  const params = {
    profileId: activeProfileId ?? undefined,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined
  }
  const { data, isLoading, isFetching, isError }
    = useSelfCareActivities(params)

  const onSortChange = (field: string) => {
    const direction
      = filters.sortField === field && filters.sortDirection === 'asc'
        ? 'desc'
        : 'asc'
    setFilters(prev => ({
      ...prev,
      page: 1,
      sortField: field,
      sortDirection: direction
    }))
  }

  const columns: ColumnDef<SelfCareActivity>[] = [
    {
      accessorKey: 'title',
      header: () => (
        <SortButton
          label="Title"
          field="title"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:text-primary/80 transition-colors text-left"
          onClick={() => setOpenId(row.original.id)}
        >
          {row.getValue('title')}
        </button>
      )
    },
    {
      accessorKey: 'date',
      header: () => (
        <SortButton
          label="Date"
          field="date"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => new Date(row.getValue('date')).toLocaleDateString()
    },
    {
      accessorKey: 'medication',
      header: () => (
        <SortButton
          label="Medication"
          field="medication"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.getValue('medication')
    },
    {
      accessorKey: 'dosage',
      header: () => (
        <SortButton
          label="Dosage"
          field="dosage"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => row.getValue('dosage')
    },
    {
      id: 'actions',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => setEditingItem(row.original)}>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeletingId(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ]

  const dateRange
    = filters.dateFrom || filters.dateTo
      ? {
          from: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
          to: filters.dateTo ? new Date(filters.dateTo) : undefined
        }
      : undefined

  if (!profile) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => setAddingItem(true)}
      addNewLabel="Add activity"
      title={`${profile.firstName}'s self-care activities`}
      description="Self-care activities - taking medications, applying treatments, wellness routines"
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      pageSize={filters.pageSize}
      onPageChange={page => setFilters(prev => ({ ...prev, page }))}
      onPageSizeChange={pageSize =>
        setFilters(prev => ({ ...prev, page: 1, pageSize }))}
      filters={{
        searchValue: filters.search,
        onSearchChange: search =>
          setFilters(prev => ({ ...prev, page: 1, search })),
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
              profileId={activeProfileId!}
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
                profileId={activeProfileId!}
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
