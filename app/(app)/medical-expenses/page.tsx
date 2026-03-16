"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import type { MedicalExpense } from "@/lib/generated/prisma/client"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { useMedicalExpenses } from "./hooks/use-medical-expenses"
import { useDeleteMedicalExpense } from "./hooks/use-delete-medical-expense"
import MedicalExpenseForm from "./medical-expense-form"
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { SortButton } from "@/components/ui/sort-button"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { EXPENSE_TYPE_LABELS } from "./constants"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Modal } from "@/components/ui/modal"
import { TableTemplate } from "@/components/table-template"

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
    profileId: activeProfileId ?? undefined,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    types: filters.types,
  })

  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()
  const [addingExpense, setAddingExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<MedicalExpense | null>(null)

  if (!profile) {
    return null
  }

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
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
            <DropdownMenuItem onSelect={() => setEditingExpense(row.original)}>
              Edit
            </DropdownMenuItem>
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

  const dateRange =
    filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  return (
    <TableTemplate
      title={`${profile.firstName}'s medical expenses`}
      columns={columns}
      data={data}
      isLoading={isLoading}
      pageSize={filters.pageSize}
      onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))}
      onAddNew={() => setAddingExpense(true)}
      filters={{
        searchValue: filters.search,
        onSearchChange: (search) => setFilters((prev) => ({ ...prev, page: 1, search })),
        searchPlaceholder: "Search expenses...",
        dateRange,
        onDateRangeChange: (range: DateRange | undefined) =>
          setFilters((prev) => ({
            ...prev,
            page: 1,
            dateFrom: range?.from ? format(range.from, "yyyy-MM-dd") : null,
            dateTo: range?.to ? format(range.to, "yyyy-MM-dd") : null,
          })),
        filterGroups: [
          {
            label: "Type",
            options: EXPENSE_TYPE_OPTIONS,
            selected: filters.types,
            onChange: (types) => setFilters((prev) => ({ ...prev, page: 1, types })),
          },
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom || filters.dateTo || filters.types.length > 0),
        onClearFilters: () => setFilters({ page: 1, search: "", dateFrom: null, dateTo: null, types: [] }),
      }}
      deleteConfig={{
        deletingId: deletingExpenseId,
        onCancel: () => setDeletingExpenseId(null),
        onConfirm: () => {
          if (deletingExpenseId === null) return
          deleteExpense(deletingExpenseId, { onSuccess: () => setDeletingExpenseId(null) })
        },
        isPending: isDeleting,
      }}
      modals={
        <>
          <Modal
            open={addingExpense}
            onOpenChange={(open) => { if (!open) setAddingExpense(false) }}
            title="Add medical expense"
            description="Fill in the details below to record a new medical expense."
          >
            <MedicalExpenseForm profileId={activeProfileId!} onClose={() => setAddingExpense(false)} />
          </Modal>

          <Modal
            open={editingExpense !== null}
            onOpenChange={(open) => { if (!open) setEditingExpense(null) }}
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
      }
    />
  )
}

export default MedicalExpenses
