"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { ColumnDef } from "@tanstack/react-table"
import type { MedicalExpenseWithRelations } from "@/app/actions/medical-expenses"
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs"
import { baseFilterParsers, defaultDateFrom, defaultDateTo } from "@/lib/query-filters"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { useMedicalExpenses } from "./hooks/use-medical-expenses"
import { useDeleteMedicalExpense } from "./hooks/use-delete-medical-expense"
import { SortButton } from "@/components/ui/sort-button"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { EXPENSE_TYPE_LABELS } from "./constants"
import { Modal } from "@/components/ui/modal"
import { RowActions } from "@/components/row-actions"
import { TableTemplate } from "@/components/table-template"
import MedicalExpenseForm from "./medical-expense-form"
import { MedicalExpenseDetailsSheet } from "./components/medical-expense-details-sheet"

const MedicalExpensesPage = () => {
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers("date"),
    types: parseAsArrayOf(parseAsString).withDefault([]),
  })

  const [deletingExpenseId, setDeletingExpenseId] = useState<string | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()
  const [addingExpense, setAddingExpense] = useState(false)
  const [editingExpense, setEditingExpense] = useState<MedicalExpenseWithRelations | null>(null)
  const [viewingExpense, setViewingExpense] = useState<MedicalExpenseWithRelations | null>(null)

  const params = {
    profileId: activeProfileId ?? undefined,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    types: filters.types,
  }
  const { data, isLoading, isFetching } = useMedicalExpenses(params)

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
  }

  const columns: ColumnDef<MedicalExpenseWithRelations>[] = [
    {
      accessorKey: "title",
      header: () => <SortButton field="title" label="Title" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => (
        <button
          className="text-primary font-medium hover:text-primary/80 transition-colors text-left"
          onClick={() => setViewingExpense(row.original)}
        >
          {row.getValue("title")}
        </button>
      ),
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
      id: "therapy",
      header: "Therapy",
      cell: ({ row }) => {
        const therapy = row.original.therapy
        return therapy
          ? <Link href={`/therapies/${therapy.id}`} className="text-primary hover:text-primary/80 transition-colors">{therapy.title}</Link>
          : "—"
      },
    },
    {
      id: "appointment",
      header: "Appointment",
      cell: ({ row }) => {
        const appointment = row.original.appointment
        return appointment
          ? <Link href={`/appointments/${appointment.id}`} className="text-primary hover:text-primary/80 transition-colors">{appointment.title}</Link>
          : "—"
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <RowActions
          onEdit={() => setEditingExpense(row.original)}
          onDelete={() => setDeletingExpenseId(row.original.id)}
        />
      ),
    },
  ]

  const dateRange =
    filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  if (!profile) {
    return null
  }

  const totalSum = data?.totalSum ?? 0
  const description = `Total sum of expenses for selected period: ${new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(totalSum)}`

  return (
    <TableTemplate
      title={`${profile.firstName}'s medical expenses`}
      description={description}
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
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
            options: Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => ({ value, label })),
            selected: filters.types,
            onChange: (types) => setFilters((prev) => ({ ...prev, page: 1, types })),
          },
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom !== defaultDateFrom || filters.dateTo !== defaultDateTo || filters.types.length > 0),
        onClearFilters: () => setFilters(() => ({ page: 1, pageSize: filters.pageSize, sortField: filters.sortField, sortDirection: filters.sortDirection, search: "", dateFrom: null, dateTo: null, types: [] })),
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
          <MedicalExpenseDetailsSheet
            expense={viewingExpense}
            open={viewingExpense !== null}
            onOpenChange={(open) => { if (!open) setViewingExpense(null) }}
          />

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

export default function Page() {
  return <Suspense><MedicalExpensesPage /></Suspense>
}
