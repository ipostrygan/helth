"use client"

import { ReactNode } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { type DateRange } from "react-day-picker"
import { Plus } from "lucide-react"
import { DataTable } from "@/components/ui/data-table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/ui/search-input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MultiSelectFilter } from "@/components/ui/multi-select-filter"
import { DialogFooter } from "@/components/ui/dialog"
import { Modal } from "@/components/ui/modal"
import { PaginatedResult } from "@/app/actions/medical-expenses"

export interface FilterGroupConfig {
  label: string
  options: { value: string; label: string }[]
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
  pageSize: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onAddNew?: () => void
  addNewLabel?: string
  filters?: FiltersConfig
  deleteConfig?: DeleteConfig
  modals?: ReactNode
}

export function TableTemplate<TData>({
  title,
  description,
  columns,
  data,
  isLoading,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onAddNew,
  addNewLabel = "Add new",
  filters,
  deleteConfig,
  modals,
}: TableTemplateProps<TData>) {
  return (
    <div className="space-y-4 p-4">
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
        <div className="flex items-center gap-2">
          {filters.onSearchChange && (
            <SearchInput
              value={filters.searchValue ?? ""}
              onChange={filters.onSearchChange}
              placeholder={filters.searchPlaceholder}
            />
          )}
          {filters.onDateRangeChange && (
            <DateRangePicker value={filters.dateRange} onChange={filters.onDateRangeChange} />
          )}
          {filters.filterGroups?.map((group) => (
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

      {isLoading || !data ? (
        <TableSkeleton rows={pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSize={pageSize}
        />
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
