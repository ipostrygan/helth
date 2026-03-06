"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MedicalExpense } from "@/lib/generated/prisma/client"
import { DataTable } from "@/components/ui/data-table"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { useMedicalExpenses } from "./hooks/use-medical-expenses"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { parseAsInteger, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"

const columns: ColumnDef<MedicalExpense>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(row.getValue("amount")),
  },
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => row.getValue("description") ?? "—",
  },
]

const MedicalExpenses = () => {
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    page:     parseAsInteger.withDefault(1),
    pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  })

  const { data, isLoading } = useMedicalExpenses(filters)

  if (!profile) {
    return null
  }

  const onPageChange = (page: number) => setFilters((prev) => ({ ...prev, page }))

  const onPageSizeChange = (pageSize: number) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-xl font-semibold">{`${profile.firstName}'s medical expenses`}</h1>
      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <DataTable columns={columns} data={data} onPageChange={onPageChange} onPageSizeChange={onPageSizeChange} pageSize={filters.pageSize} />
      )}
    </div>
  )
}

export default MedicalExpenses
