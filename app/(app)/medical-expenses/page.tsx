"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { MedicalExpense } from "@/lib/generated/prisma/client"
import { DataTable } from "@/components/ui/data-table"
import { TableSkeleton } from "@/components/ui/table-skeleton"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { useMedicalExpenses } from "./hooks/use-medical-expenses"
import { useDeleteMedicalExpense } from "./hooks/use-delete-medical-expense"
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { SortButton } from "@/components/ui/sort-button"
import { SearchInput } from "@/components/ui/search-input"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { MultiSelectFilter } from "@/components/ui/multi-select-filter"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { EXPENSE_TYPE_LABELS } from "./constants"
import { MoreHorizontal, Loader2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const EXPENSE_TYPE_OPTIONS = Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => ({ value, label }))

const MedicalExpenses = () => {
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    page:          parseAsInteger.withDefault(1),
    pageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    sortField:     parseAsString.withDefault("date"),
    sortDirection: parseAsString.withDefault("desc"),
    search:        parseAsString.withDefault(""),
    dateFrom:      parseAsString,
    dateTo:        parseAsString,
    types:         parseAsArrayOf(parseAsString).withDefault([]),
  })

  const { data, isLoading } = useMedicalExpenses({
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    types: filters.types,
  })

  const [deletingExpenseId, setDeletingExpenseId] = useState<number | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()

  if (!profile) {
    return null
  }

  const onPageChange = (page: number) => setFilters((prev) => ({ ...prev, page }))

  const onPageSizeChange = (pageSize: number) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
  }

  const onConfirmDelete = () => {
    if (deletingExpenseId === null) return
    deleteExpense(deletingExpenseId, {
      onSuccess: () => setDeletingExpenseId(null),
    })
  }

  const columns: ColumnDef<MedicalExpense>[] = [
    {
      accessorKey: "title",
      header: () => <SortButton field="title" label="Title" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
    },
    {
      accessorKey: "amount",
      header: () => <SortButton field="amount" label="Amount" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(row.getValue("amount")),
    },
    {
      accessorKey: "date",
      header: () => <SortButton field="date" label="Date" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => EXPENSE_TYPE_LABELS[row.getValue("type") as keyof typeof EXPENSE_TYPE_LABELS],
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.getValue("description") ?? "—",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setDeletingExpenseId(row.original.id)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const onSearchChange = (search: string) => setFilters((prev) => ({ ...prev, page: 1, search }))

  const onDateRangeChange = (range: DateRange | undefined) =>
    setFilters((prev) => ({
      ...prev,
      page: 1,
      dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : null,
      dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : null,
    }))

  const hasActiveFilters = filters.search || filters.dateFrom || filters.dateTo || filters.types.length > 0

  const onClearFilters = () =>
    setFilters({ page: 1, search: "", dateFrom: null, dateTo: null, types: [] })

  const dateRange =
    filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">{`${profile.firstName}'s medical expenses`}</h1>
      <div className="flex items-center gap-2">
        <SearchInput value={filters.search} onChange={onSearchChange} placeholder="Search expenses..." />
        <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        <MultiSelectFilter
          label="Type"
          options={EXPENSE_TYPE_OPTIONS}
          selected={filters.types}
          onChange={(types) => setFilters((prev) => ({ ...prev, page: 1, types }))}
        />
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>
      {isLoading || !data ? (
        <TableSkeleton rows={filters.pageSize} columns={columns.length} />
      ) : (
        <DataTable
          columns={columns}
          data={data}
          onPageChange={onPageChange}
          onPageSizeChange={onPageSizeChange}
          pageSize={filters.pageSize}
        />
      )}

      <Dialog open={deletingExpenseId !== null} onOpenChange={(open) => { if (!open) setDeletingExpenseId(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingExpenseId(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={onConfirmDelete} disabled={isDeleting}>
              {isDeleting && <Loader2 className="animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MedicalExpenses
