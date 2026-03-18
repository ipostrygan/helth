"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import type { Appointment } from "@/lib/generated/prisma/client"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { useAppointments } from "./hooks/use-appointments"
import { useDeleteAppointment } from "./hooks/use-delete-appointment"
import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"
import { DEFAULT_PAGE_SIZE } from "@/lib/constants"
import { SortButton } from "@/components/ui/sort-button"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { APPOINTMENT_STATUS_LABELS, APPOINTMENT_TYPE_LABELS } from "./constants"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { TableTemplate } from "@/components/table-template"

const APPOINTMENT_STATUS_OPTIONS = Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => ({ value, label }))

const AppointmentsPage = () => {
  const router = useRouter()
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
    statuses:      parseAsArrayOf(parseAsString).withDefault([]),
  })

  const { data, isLoading } = useAppointments({
    profileId: activeProfileId ?? undefined,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
    statuses: filters.statuses,
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteAppointment()

  if (!profile) {
    return null
  }

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
  }

  const columns: ColumnDef<Appointment>[] = [
    {
      accessorKey: "title",
      header: () => <SortButton field="title" label="Title" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
    },
    {
      accessorKey: "date",
      header: () => <SortButton field="date" label="Date" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => new Date(row.getValue("date")).toLocaleDateString(),
    },
    {
      accessorKey: "endDate",
      header: () => <SortButton field="endDate" label="End Date" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => {
        const val = row.getValue("endDate")
        return val ? new Date(val as string).toLocaleDateString() : "—"
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => APPOINTMENT_TYPE_LABELS[row.getValue("type") as keyof typeof APPOINTMENT_TYPE_LABELS],
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => APPOINTMENT_STATUS_LABELS[row.getValue("status") as keyof typeof APPOINTMENT_STATUS_LABELS],
    },
    {
      accessorKey: "doctorName",
      header: () => <SortButton field="doctorName" label="Doctor" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => row.getValue("doctorName") ?? "—",
    },
    {
      accessorKey: "location",
      header: () => <SortButton field="location" label="Location" sortField={filters.sortField} sortDirection={filters.sortDirection} onSortChange={onSortChange} />,
      cell: ({ row }) => row.getValue("location") ?? "—",
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => row.getValue("notes") ?? "—",
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
            <DropdownMenuItem onSelect={() => router.push(`/appointments/${row.original.id}/edit`)}>
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
      ),
    },
  ]

  const dateRange =
    filters.dateFrom || filters.dateTo
      ? { from: filters.dateFrom ? new Date(filters.dateFrom) : undefined, to: filters.dateTo ? new Date(filters.dateTo) : undefined }
      : undefined

  return (
    <TableTemplate
      onAddNew={() => router.push("/appointments/create")}
      addNewLabel="Add Appointment"
      title={`${profile.firstName}'s appointments`}
      description="Past medical appointments"
      columns={columns}
      data={data}
      isLoading={isLoading}
      pageSize={filters.pageSize}
      onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))}
      filters={{
        searchValue: filters.search,
        onSearchChange: (search) => setFilters((prev) => ({ ...prev, page: 1, search })),
        searchPlaceholder: "Search appointments...",
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
            label: "Status",
            options: APPOINTMENT_STATUS_OPTIONS,
            selected: filters.statuses,
            onChange: (statuses) => setFilters((prev) => ({ ...prev, page: 1, statuses })),
          },
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom || filters.dateTo || filters.statuses.length > 0),
        onClearFilters: () => setFilters({ page: 1, search: "", dateFrom: null, dateTo: null, statuses: [] }),
      }}
      deleteConfig={{
        deletingId,
        onCancel: () => setDeletingId(null),
        onConfirm: () => {
          if (deletingId === null) return
          deleteItem(deletingId, { onSuccess: () => setDeletingId(null) })
        },
        isPending: isDeleting,
      }}
    />
  )
}

export default AppointmentsPage
