'use client'

import { Suspense, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import type { TherapyWithUser } from '@/app/actions/therapies'
import { parseAsArrayOf, parseAsString, useQueryStates } from 'nuqs'
import { baseFilterParsers, defaultDateFrom, defaultDateTo } from '@/lib/search-params'
import { useActiveProfile } from '@/context/profile-context'
import { useProfile } from '../users/hooks/use-profile'
import { getProfileDisplayName } from '../users/utils/profile.utils'
import { useTherapies } from './hooks/use-therapies'
import { useDeleteTherapy } from './hooks/use-delete-therapy'
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
import { AppLink } from '@/components/custom/app-link'
import { TableTemplate, type SortChange } from '@/components/table-template'
import { StatusBadge } from '@/components/custom/status-badge'

const IS_ACTIVE_OPTIONS = [
  { value: 'true', label: 'Ongoing' },
  { value: 'false', label: 'Finished' }
]

const TherapiesPage = () => {
  const router = useRouter()
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers('startDate'),
    isActive: parseAsArrayOf(parseAsString).withDefault([])
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteTherapy()

  const profileId = isFamilyProfile ? undefined : activeProfileId

  const params = {
    profileId,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined
  }
  const { data, isLoading, isFetching, isError } = useTherapies(params)

  const sorting: SortingState = [{ id: filters.sortField, desc: filters.sortDirection === 'desc' }]
  const onSortingChange = ({ sortField, sortDirection }: SortChange) => {
    setFilters(prev => ({ ...prev, page: 1, sortField, sortDirection }))
  }

  const columns: ColumnDef<TherapyWithUser>[] = [
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
    },
    {
      id: 'profile',
      header: 'Profile',
      cell: ({ row }) => {
        const user = row.original.user
        return user.profileType === 'Human' ? (user.firstName ?? '') : (user.shortName ?? '')
      }
    },
    {
      id: 'actions',
      enableSorting: false,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => router.push(`/therapies/${row.original.id}/edit`)}>
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
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  if (!profile) {
    return null
  }

  return (
    <TableTemplate
      onAddNew={() => router.push('/therapies/create')}
      addNewLabel="Add Therapy"
      title={isFamilyProfile ? 'Family\'s Therapies' : `${getProfileDisplayName(profile)}'s Therapies`}
      description="Ongoing and finished therapy sessions"
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
        searchPlaceholder: 'Search therapies...',
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
            label: 'Status',
            options: IS_ACTIVE_OPTIONS,
            selected: filters.isActive,
            onChange: isActive => setFilters(prev => ({ ...prev, page: 1, isActive }))
          }
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom !== defaultDateFrom || filters.dateTo !== defaultDateTo || filters.isActive.length > 0),
        onClearFilters: () => setFilters(() => ({ page: 1, pageSize: filters.pageSize, sortField: 'startDate', sortDirection: 'desc', search: '', dateFrom: null, dateTo: null, isActive: [] }))
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
    />
  )
}

export default function Page() {
  return <Suspense><TherapiesPage /></Suspense>
}
