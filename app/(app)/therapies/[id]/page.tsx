"use client"

import { use, useState } from "react"
import { useTherapy } from "../hooks/use-therapy"
import { Separator } from "@/components/ui/separator"
import { TableTemplate } from "@/components/table-template"
import { useMedicalExpenses } from "../../medical-expenses/hooks/use-medical-expenses"
import { useDeleteMedicalExpense } from "../../medical-expenses/hooks/use-delete-medical-expense"
import { ColumnDef } from "@tanstack/react-table"
import type { MedicalExpense } from "@/lib/generated/prisma/client"
import { SortButton } from "@/components/ui/sort-button"
import { EXPENSE_TYPE_LABELS } from "../../medical-expenses/constants"
import { RowActions } from "@/components/row-actions"
import { parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

type TherapyDetailPageProps = {
  params: Promise<{ id: string }>
}

const TherapyDetailPage = ({ params }: TherapyDetailPageProps) => {
  const { id } = use(params)
  const { data: therapy, isLoading } = useTherapy(id)

  const [filters, setFilters] = useQueryStates({
    page:          parseAsInteger.withDefault(1),
    pageSize:      parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
    sortField:     parseAsString.withDefault("date"),
    sortDirection: parseAsString.withDefault("desc"),
  })

  const { data: expensesData, isLoading: isExpensesLoading } = useMedicalExpenses({
    therapyId: id,
    ...filters,
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteMedicalExpense()

  if (isLoading) return null
  if (!therapy) return null

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
        <RowActions
          onDelete={() => setDeletingId(row.original.id)}
        />
      ),
    },
  ]

  return (
    <div className="px-6 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{therapy.title}</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Details</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <DetailRow label="Status">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                therapy.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              {therapy.isActive ? "Ongoing" : "Finished"}
            </span>
          </DetailRow>
          <Separator />
          <DetailRow label="Start Date">
            {new Date(therapy.startDate).toLocaleDateString()}
          </DetailRow>
          <Separator />
          <DetailRow label="End Date">
            {therapy.endDate ? new Date(therapy.endDate).toLocaleDateString() : "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Therapist">
            {therapy.therapistName ? (
              therapy.therapistInfoLink ? (
                <a
                  href={therapy.therapistInfoLink}
                  target={therapy.therapistInfoLink.startsWith("http") ? "_blank" : undefined}
                  rel={therapy.therapistInfoLink.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="underline hover:no-underline"
                >
                  {therapy.therapistName}
                </a>
              ) : (
                therapy.therapistName
              )
            ) : (
              "—"
            )}
          </DetailRow>
          <Separator />
          <DetailRow label="Location">
            {therapy.location ?? "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {therapy.description ?? "—"}
          </DetailRow>
        </div>
      </div>

      <TableTemplate
        title="Medical Expenses"
        columns={columns}
        data={expensesData}
        isLoading={isExpensesLoading}
        pageSize={filters.pageSize}
        onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
        onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))}
        deleteConfig={{
          deletingId,
          onCancel: () => setDeletingId(null),
          onConfirm: () => {
            if (deletingId === null) return
            deleteExpense(deletingId, { onSuccess: () => setDeletingId(null) })
          },
          isPending: isDeleting,
        }}
      />
    </div>
  )
}

const DetailRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-0">
    <span className="text-sm text-muted-foreground sm:w-48 shrink-0">{label}</span>
    <span className="text-sm">{children}</span>
  </div>
)

export default TherapyDetailPage
