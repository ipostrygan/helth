'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { DatePickerField } from '@/components/custom/date-picker-field'
import { DialogFooter } from '@/components/ui/dialog'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date(),
  description: z.string().optional(),
  medication: z.string().min(1, 'Medication is required'),
  dosage: z.string().min(1, 'Dosage is required')
})

export type SelfCareActivityFormValues = z.infer<typeof schema>

type SelfCareActivityFormProps = {
  onClose: () => void
  onSubmit: (values: SelfCareActivityFormValues) => Promise<void>
  selfCareActivity?: SelfCareActivity
  isSubmitDisabled?: boolean
}

const SelfCareActivityForm = ({ onClose, onSubmit, selfCareActivity, isSubmitDisabled }: SelfCareActivityFormProps) => {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<SelfCareActivityFormValues>({
    mode: 'all',
    resolver: zodResolver(schema),
    defaultValues: selfCareActivity
      ? {
          title: selfCareActivity.title,
          date: new Date(selfCareActivity.date),
          description: selfCareActivity.description ?? undefined,
          medication: selfCareActivity.medication,
          dosage: selfCareActivity.dosage
        }
      : undefined
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label htmlFor="title" required>Title</Label>
          <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <DatePickerField
              label="Date"
              required
              value={field.value}
              onChange={field.onChange}
              error={errors.date}
            />
          )}
        />

        <Field>
          <Label htmlFor="medication" required>Medication</Label>
          <Input id="medication" {...register('medication')} aria-invalid={!!errors.medication} />
          <FieldError errors={[errors.medication]} />
        </Field>

        <Field>
          <Label htmlFor="dosage" required>Dosage</Label>
          <Input id="dosage" {...register('dosage')} aria-invalid={!!errors.dosage} />
          <FieldError errors={[errors.dosage]} />
        </Field>

        <Field>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register('description')} />
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isPending={isSubmitting} disabled={!isDirty || !isValid || isSubmitDisabled}>
          {selfCareActivity ? 'Save' : 'Submit'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default SelfCareActivityForm
