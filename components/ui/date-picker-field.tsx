'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Field, FieldError } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerFieldProps = {
  label: string
  value: Date | undefined
  onChange: (date: Date | undefined) => void
  error?: { message?: string }
  placeholder?: string
}

export function DatePickerField({
  label,
  value,
  onChange,
  error,
  placeholder = 'Pick a date'
}: DatePickerFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <Field>
      <Label>{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            aria-invalid={!!error}
            className={cn(
              'w-full justify-start gap-2 font-normal',
              !value && 'text-muted-foreground',
              error && 'border-destructive'
            )}
          >
            <CalendarIcon className="size-4 shrink-0" />
            {value ? format(value, 'MMM d, yyyy') : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            autoFocus
          />
        </PopoverContent>
      </Popover>
      <FieldError errors={[error]} />
    </Field>
  )
}
