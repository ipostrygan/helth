"use client"

import * as React from "react"
import { CheckIcon, ChevronsUpDownIcon, XIcon } from "lucide-react"
import { useTherapies } from "@/app/(app)/therapies/hooks/use-therapies"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type TherapyComboboxProps = {
  profileId: string
  value?: string | null
  onChange: (value: string | null) => void
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export function TherapyCombobox({ profileId, value, onChange }: TherapyComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const debouncedSearch = useDebounce(search, 300)

  const { data, isLoading } = useTherapies({
    profileId,
    search: debouncedSearch,
    pageSize: 20,
  })

  const therapies = data?.data ?? []
  const selected = value ? therapies.find((t) => t.id === value) : null

  // If value is set but not found in current results (e.g. on edit load), fetch it
  const { data: allData } = useTherapies({
    profileId,
    pageSize: 100,
  })
  const selectedTherapy = value
    ? (allData?.data ?? []).find((t) => t.id === value) ?? selected
    : null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div className="flex gap-1">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal"
          >
            {selectedTherapy ? (
              <span className="truncate">{selectedTherapy.title}</span>
            ) : (
              <span className="text-muted-foreground">Select a therapy…</span>
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
            aria-label="Clear therapy"
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
            placeholder="Search therapies…"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="overflow-y-auto max-h-68" onWheel={(e) => e.stopPropagation()}>
            {isLoading ? (
              <CommandEmpty>Loading…</CommandEmpty>
            ) : therapies.length === 0 ? (
              <CommandEmpty>No therapies found.</CommandEmpty>
            ) : (
              <CommandGroup>
                {therapies.map((therapy) => (
                  <CommandItem
                    key={therapy.id}
                    value={therapy.id}
                    onSelect={() => {
                      onChange(therapy.id === value ? null : therapy.id)
                      setOpen(false)
                    }}
                  >
                    <CheckIcon
                      className={cn("mr-2 size-4", value === therapy.id ? "opacity-100" : "opacity-0")}
                    />
                    {therapy.title}
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
