"use client"

import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { format } from "date-fns"
import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type DateRangePickerProps = {
  value?: DateRange
  onChange: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>(value)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  const handleOpenChange = (next: boolean) => {
    if (next) setDraft(value)
    setOpen(next)
  }

  const handleApply = () => {
    onChange?.(draft)
    setOpen(false)
  }

  const label = value?.from
    ? value.to
      ? `${format(value.from, "MMM d, yyyy")} – ${format(value.to, "MMM d, yyyy")}`
      : format(value.from, "MMM d, yyyy")
    : placeholder

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full justify-start gap-2 font-normal sm:w-64",
            !value?.from && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={draft}
          onSelect={setDraft}
          numberOfMonths={isMobile ? 1 : 2}
          autoFocus
          resetOnSelect
        />
        <div className="flex justify-end border-t p-3">
          <Button size="sm" onClick={handleApply} disabled={!draft?.from}>
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
