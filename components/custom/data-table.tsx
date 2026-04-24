'use client'

import { Fragment } from 'react'
import {
  ColumnDef,
  OnChangeFn,
  SortingState,
  flexRender,
  getCoreRowModel,
  useReactTable
} from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination'
import type { PaginatedResult } from '@/types'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: PaginatedResult<TData>
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  pageSize: number
  hasActiveFilters?: boolean
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onPageChange,
  onPageSizeChange,
  pageSize = DEFAULT_PAGE_SIZE,
  hasActiveFilters = false,
  sorting,
  onSortingChange
}: DataTableProps<TData, TValue>) {
  'use no memo'
  const table = useReactTable({
    data: data.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: { sorting },
    onSortingChange
  })

  const isEmpty = data.total === 0 && !hasActiveFilters
  const current = data.page - 1 // 0-indexed for display
  const totalPages = data.totalPages
  const canPrev = data.page > 1
  const canNext = data.page < totalPages
  const rangeStart = data.total === 0 ? 0 : (data.page - 1) * pageSize + 1
  const rangeEnd = Math.min(data.page * pageSize, data.total)

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()
                  const SortIcon = sorted === 'asc' ? ArrowUp : sorted === 'desc' ? ArrowDown : ArrowUpDown
                  return (
                    <TableHead
                      key={header.id}
                      className={[
                        header.column.id === 'actions' ? 'sticky right-0 bg-background' : undefined,
                        isEmpty ? 'pointer-events-none' : undefined
                      ].filter(Boolean).join(' ') || undefined}
                    >
                      {header.isPlaceholder
                        ? null
                        : canSort
                          ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={header.column.getToggleSortingHandler()}
                                className="-ml-3"
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                <SortIcon className="h-4 w-4 shrink-0" />
                              </Button>
                            )
                          : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length
              ? (
                  table.getRowModel().rows.map(row => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                      {row.getVisibleCells().map(cell => (
                        <TableCell
                          key={cell.id}
                          className={cell.column.id === 'actions' ? 'sticky right-0 bg-background' : undefined}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )
              : null}
          </TableBody>
        </Table>
        {!table.getRowModel().rows.length && (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
            No results.
          </div>
        )}
      </div>

      {(data.total > 0 || hasActiveFilters) && (
        <div className="flex flex-col gap-3 px-1 sm:flex-row sm:items-center sm:justify-between">
          {data.total > 0 && (
            <p className="text-center text-sm sm:text-left">
              Showing
              {' '}
              {rangeStart}
              –
              {rangeEnd}
              {' '}
              of
              {' '}
              {data.total}
              {' '}
              items
            </p>
          )}

          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-2 text-sm">
              Rows per page:
              <Select
                value={String(pageSize)}
                onValueChange={(val) => { onPageSizeChange(Number(val)) }}
              >
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map(size => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Pagination className="mx-0 w-auto justify-end">
              <PaginationContent>
                <PaginationItem className="hidden sm:list-item">
                  <PaginationFirst
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(1)
                    }}
                    aria-disabled={!canPrev}
                    className={!canPrev ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(data.page - 1)
                    }}
                    aria-disabled={!canPrev}
                    className={!canPrev ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => {
                  const show = i === 0 || i === totalPages - 1 || Math.abs(i - current) <= 1
                  const showEllipsisBefore = i === totalPages - 1 && current < totalPages - 3
                  const showEllipsisAfter = i === 0 && current > 2

                  if (!show) return null
                  return (
                    <Fragment key={i}>
                      {showEllipsisBefore && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                      <PaginationItem>
                        <PaginationLink
                          href="#"
                          isActive={i === current}
                          onClick={(e) => {
                            e.preventDefault()
                            onPageChange(i + 1)
                          }}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                      {showEllipsisAfter && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                    </Fragment>
                  )
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(data.page + 1)
                    }}
                    aria-disabled={!canNext}
                    className={!canNext ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                <PaginationItem className="hidden sm:list-item">
                  <PaginationLast
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onPageChange(totalPages)
                    }}
                    aria-disabled={!canNext}
                    className={!canNext ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      )}
    </div>
  )
}
