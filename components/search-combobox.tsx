'use client'

import { CheckIcon, ChevronsUpDownIcon, XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export type SearchComboboxItem = {
  id: string
  label: string
}

type SearchComboboxProps = {
  id?: string
  value?: string | null
  onChange: (value: string | null) => void
  items: SearchComboboxItem[]
  isLoading?: boolean
  onSearchChange?: (search: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** Label for the selected item when it is not present in `items` (e.g. during edit load) */
  selectedLabel?: string
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function SearchCombobox({
  id,
  value,
  onChange,
  items,
  isLoading,
  onSearchChange,
  placeholder = 'Select an item…',
  searchPlaceholder = 'Search…',
  emptyText = 'No items found.',
  selectedLabel
}: SearchComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    onSearchChange?.(debouncedSearch)
  }, [debouncedSearch, onSearchChange])

  const selected = value ? items.find(item => item.id === value) : null
  const displayLabel = selected?.label ?? selectedLabel

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-1">
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {displayLabel
              ? (
                  <span className="truncate">{displayLabel}</span>
                )
              : (
                  <span className="text-muted-foreground">{placeholder}</span>
                )}
            <ChevronsUpDownIcon className="ml-2 size-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        {value && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0"
            onClick={() => onChange(null)}
            aria-label="Clear selection"
          >
            <XIcon className="size-4" />
          </Button>
        )}
      </div>
      <PopoverContent
        className="w-(--radix-popover-trigger-width) p-0 max-h-[min(var(--radix-popper-available-height),320px)]"
        align="start"
      >
        <Command shouldFilter={false} className="flex flex-col">
          <CommandInput
            placeholder={searchPlaceholder}
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="overflow-y-auto max-h-68" onWheel={e => e.stopPropagation()}>
            {isLoading
              ? (
                  <CommandEmpty>Loading…</CommandEmpty>
                )
              : items.length === 0
                ? (
                    <CommandEmpty>{emptyText}</CommandEmpty>
                  )
                : (
                    <CommandGroup>
                      {items.map(item => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => {
                            onChange(item.id === value ? null : item.id)
                            setOpen(false)
                          }}
                        >
                          <CheckIcon
                            className={cn('mr-2 size-4', value === item.id ? 'opacity-100' : 'opacity-0')}
                          />
                          {item.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
