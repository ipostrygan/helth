'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Therapy } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  isActive: z.boolean()
})

export type TherapyFormValues = z.infer<typeof schema>

type TherapyFormProps = {
  therapy?: Therapy
  onSubmit: (values: TherapyFormValues) => Promise<void>
}

const TherapyForm = ({ therapy, onSubmit }: TherapyFormProps) => {
  const router = useRouter()
  const isEditMode = !!therapy
  const [startCalendarOpen, setStartCalendarOpen] = useState(false)
  const [endCalendarOpen, setEndCalendarOpen] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<TherapyFormValues>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: therapy
      ? {
          title: therapy.title,
          description: therapy.description ?? undefined,
          startDate: new Date(therapy.startDate),
          endDate: therapy.endDate ? new Date(therapy.endDate) : undefined,
          isActive: therapy.isActive
        }
      : { isActive: true }
  })

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="flex-1 p-3 xs:p-6 w-full">
        <form id="therapy-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <Label htmlFor="title" required>Title</Label>
              <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register('description')} />
            </Field>

            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label required>Start Date</Label>
                  <Popover open={startCalendarOpen} onOpenChange={setStartCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        aria-invalid={!!errors.startDate}
                        className={cn(
                          'w-full justify-start gap-2 font-normal',
                          !field.value && 'text-muted-foreground',
                          errors.startDate && 'border-destructive'
                        )}
                      >
                        <CalendarIcon className="size-4 shrink-0" />
                        {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick a date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setStartCalendarOpen(false)
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError errors={[errors.startDate]} />
                </Field>
              )}
            />

            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>End Date</Label>
                  <Popover open={endCalendarOpen} onOpenChange={setEndCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start gap-2 font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="size-4 shrink-0" />
                        {field.value ? format(field.value, 'MMM d, yyyy') : 'Pick a date (optional)'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          field.onChange(date)
                          setEndCalendarOpen(false)
                        }}
                        autoFocus
                      />
                    </PopoverContent>
                  </Popover>
                </Field>
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>Status</Label>
                  <Select
                    value={field.value ? 'true' : 'false'}
                    onValueChange={val => field.onChange(val === 'true')}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Ongoing</SelectItem>
                      <SelectItem value="false">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </div>

      <div className="sticky bottom-0 border-t bg-background py-4">
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push(isEditMode ? `/therapies/${therapy.id}` : '/therapies')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="therapy-form" isPending={isSubmitting} disabled={!isDirty || !isValid}>
            {isEditMode ? 'Save' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TherapyForm
