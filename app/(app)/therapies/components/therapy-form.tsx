'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Therapy } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerField } from '@/components/custom/date-picker-field'

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
  onClose: () => void
  onSubmit: (values: TherapyFormValues) => Promise<void>
  isSubmitDisabled?: boolean
}

const TherapyForm = ({ therapy, onClose, onSubmit, isSubmitDisabled }: TherapyFormProps) => {
  const isEditMode = !!therapy
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
                <DatePickerField
                  label="Start Date"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.startDate}
                />
              )}
            />

            <Controller
              name="endDate"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label="End Date"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Pick a date (optional)"
                />
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
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" form="therapy-form" isPending={isSubmitting} disabled={!isDirty || !isValid || isSubmitDisabled}>
            {isEditMode ? 'Save' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default TherapyForm
