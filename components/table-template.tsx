'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ColumnDef, SortingState } from '@tanstack/react-table'
import { type DateRange } from 'react-day-picker'
import { AlertCircle, Plus } from 'lucide-react'
import { DataTable } from '@/components/custom/data-table'
import { TableSkeleton } from '@/components/custom/table-skeleton'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/custom/search-input'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { MultiSelectFilter } from '@/components/custom/multi-select-filter'
import { DialogFooter } from '@/components/ui/dialog'
import { Modal } from '@/components/custom/modal'
import type { PaginatedResult } from '@/types'

export interface SortChange {
  sortField: string
  sortDirection: 'asc' | 'desc'
}

export interface FilterGroupConfig {
  label: string
  options: { value: string, label: string }[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export interface FiltersConfig {
  searchValue?: string
  onSearchChange?: (search: string) => void
  searchPlaceholder?: string
  dateRange?: DateRange
  onDateRangeChange?: (range: DateRange | undefined) => void
  filterGroups?: FilterGroupConfig[]
  hasActiveFilters?: boolean
  onClearFilters?: () => void
}

export interface DeleteConfig {
  deletingId: string | null
  onCancel: () => void
  onConfirm: () => void
  isPending: boolean
}

interface TableTemplateProps<TData> {
  title: string
  description?: string
  columns: ColumnDef<TData>[]
  data: PaginatedResult<TData> | undefined
  isLoading: boolean
  isFetching?: boolean
  isError?: boolean
  errorTitle?: string
  errorMessage?: string
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  sorting?: SortingState
  onSortingChange?: (sort: SortChange) => void
  onAddNew?: () => void
  addNewLabel?: string
  filters?: FiltersConfig
  deleteConfig?: DeleteConfig
  modals?: ReactNode
  className?: string
}

export function TableTemplate<TData>({
  title,
  description,
  columns,
  data,
  isLoading,
  isFetching,
  isError,
  errorTitle = 'Failed to load data',
  errorMessage = 'Something went wrong. Please try again later.',
  pageSize,
  onPageChange,
  onPageSizeChange,
  sorting,
  onSortingChange,
  onAddNew,
  addNewLabel = 'Add new',
  filters,
  deleteConfig,
  modals,
  className
}: TableTemplateProps<TData>) {
  return (
    <div className={cn('space-y-4', className ?? 'p-0')}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {onAddNew && (
          <Button size="sm" onClick={onAddNew}>
            <Plus />
            {addNewLabel}
          </Button>
        )}
      </div>

      {filters && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.onSearchChange && (
            <SearchInput
              value={filters.searchValue ?? ''}
              onChange={filters.onSearchChange}
              placeholder={filters.searchPlaceholder}
            />
          )}
          {filters.onDateRangeChange && (
            <DateRangePicker value={filters.dateRange} onChange={filters.onDateRangeChange} />
          )}
          {filters.filterGroups?.map(group => (
            <MultiSelectFilter
              key={group.label}
              label={group.label}
              options={group.options}
              selected={group.selected}
              onChange={group.onChange}
            />
          ))}
          {filters.hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-9" onClick={filters.onClearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      )}

      {isLoading
        ? (
            <TableSkeleton rows={pageSize} columns={columns.length} />
          )
        : isError
          ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 py-12 text-center">
                <AlertCircle className="h-8 w-8 text-destructive" />
                <p className="text-lg font-semibold text-destructive">{errorTitle}</p>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
              </div>
            )
          : !data
              ? (
                  <TableSkeleton rows={pageSize} columns={columns.length} />
                )
              : (
                  <div className={isFetching ? 'opacity-50 pointer-events-none transition-opacity' : 'transition-opacity'}>
                    <DataTable
                      columns={columns}
                      data={data}
                      onPageChange={onPageChange}
                      onPageSizeChange={onPageSizeChange}
                      pageSize={pageSize}
                      hasActiveFilters={filters?.hasActiveFilters}
                      sorting={sorting}
                      onSortingChange={onSortingChange}
                    />
                  </div>
                )}

      {deleteConfig && (
        <Modal
          open={deleteConfig.deletingId !== null}
          onOpenChange={(open) => { if (!open) deleteConfig.onCancel() }}
          title="Delete"
          description="Are you sure you want to delete this item? This action cannot be undone."
        >
          <DialogFooter>
            <Button variant="outline" onClick={deleteConfig.onCancel} disabled={deleteConfig.isPending}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteConfig.onConfirm} isPending={deleteConfig.isPending}>
              Delete
            </Button>
          </DialogFooter>
        </Modal>
      )}

      {modals}
    </div>
  )
}
