"use client"

import { Suspense, useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import type { Therapy } from "@/lib/generated/prisma/client"
import { parseAsArrayOf, parseAsString, useQueryStates } from "nuqs"
import { baseFilterParsers } from "@/lib/query-filters"
import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"
import { useTherapies } from "./hooks/use-therapies"
import { useDeleteTherapy } from "./hooks/use-delete-therapy"
import { SortButton } from "@/components/ui/sort-button"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { TableTemplate } from "@/components/table-template"

const IS_ACTIVE_OPTIONS = [
  { value: "true", label: "Ongoing" },
  { value: "false", label: "Finished" },
]

const TherapiesPage = () => {
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [filters, setFilters] = useQueryStates({
    ...baseFilterParsers("startDate"),
    isActive: parseAsArrayOf(parseAsString).withDefault([]),
  })

  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { mutate: deleteItem, isPending: isDeleting } = useDeleteTherapy()

  const params = {
    profileId: activeProfileId ?? undefined,
    ...filters,
    dateFrom: filters.dateFrom ?? undefined,
    dateTo: filters.dateTo ?? undefined,
  }
  const { data, isLoading, isFetching } = useTherapies(params)

  const onSortChange = (field: string) => {
    const direction = filters.sortField === field && filters.sortDirection === "asc" ? "desc" : "asc"
    setFilters((prev) => ({ ...prev, page: 1, sortField: field, sortDirection: direction }))
  }

  const columns: ColumnDef<Therapy>[] = [
    {
      accessorKey: "title",
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
        <Link
          href={`/therapies/${row.original.id}`}
          className="text-primary font-medium hover:text-primary/80 transition-colors"
        >
          {row.getValue("title")}
        </Link>
      ),
    },
    {
      accessorKey: "startDate",
      header: () => (
        <SortButton
          label="Start Date"
          field="startDate"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => new Date(row.getValue("startDate")).toLocaleDateString(),
    },
    {
      accessorKey: "endDate",
      header: () => (
        <SortButton
          label="End Date"
          field="endDate"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const val = row.getValue<string | null>("endDate")
        return val ? new Date(val).toLocaleDateString() : "—"
      },
    },
    {
      accessorKey: "therapistName",
      header: () => (
        <SortButton
          label="Therapist"
          field="therapistName"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const value = row.getValue<string | null>("therapistName") ?? "—"
        const url = row.original.therapistInfoLink
        if (!url || value === "—") return value
        return (
          <a
            href={url}
            target={url.startsWith("http") ? "_blank" : undefined}
            rel={url.startsWith("http") ? "noopener noreferrer" : undefined}
            className="text-primary font-medium hover:text-primary/80 transition-colors"
          >
            {value}
          </a>
        )
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => row.getValue("location") ?? "—",
    },
    {
      accessorKey: "isActive",
      header: () => (
        <SortButton
          label="Status"
          field="isActive"
          sortField={filters.sortField}
          sortDirection={filters.sortDirection}
          onSortChange={onSortChange}
        />
      ),
      cell: ({ row }) => {
        const active = row.getValue<boolean>("isActive")
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
              active
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {active ? "Ongoing" : "Finished"}
          </span>
        )
      },
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

  return (
    <TableTemplate
      onAddNew={() => router.push("/therapies/create")}
      addNewLabel="Add Therapy"
      title={`${profile.firstName}'s Therapies`}
      description="Ongoing and finished therapy sessions"
      columns={columns}
      data={data}
      isLoading={isLoading}
      isFetching={isFetching}
      pageSize={filters.pageSize}
      onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
      onPageSizeChange={(pageSize) => setFilters((prev) => ({ ...prev, page: 1, pageSize }))}
      filters={{
        searchValue: filters.search,
        onSearchChange: (search) => setFilters((prev) => ({ ...prev, page: 1, search })),
        searchPlaceholder: "Search therapies...",
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
            options: IS_ACTIVE_OPTIONS,
            selected: filters.isActive,
            onChange: (isActive) => setFilters((prev) => ({ ...prev, page: 1, isActive })),
          },
        ],
        hasActiveFilters: !!(filters.search || filters.dateFrom || filters.dateTo || filters.isActive.length > 0),
        onClearFilters: () => setFilters(() => ({ page: 1, pageSize: filters.pageSize, sortField: filters.sortField, sortDirection: filters.sortDirection, search: "", dateFrom: null, dateTo: null, isActive: [] })),
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

export default function Page() {
  return <Suspense><TherapiesPage /></Suspense>
}
