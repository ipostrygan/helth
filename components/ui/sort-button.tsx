'use client'

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SortButtonProps {
  field: string
  label: string
  sortField: string
  sortDirection: string
  onSortChange: (field: string) => void
}

export function SortButton({ field, label, sortField, sortDirection, onSortChange }: SortButtonProps) {
  const isSorted = sortField === field
  const Icon = isSorted
    ? sortDirection === 'asc' ? ArrowUp : ArrowDown
    : ArrowUpDown
  return (
    <Button variant="ghost" onClick={() => onSortChange(field)}>
      {label}
      {' '}
      <Icon className="ml-1 h-4 w-4" />
    </Button>
  )
}
