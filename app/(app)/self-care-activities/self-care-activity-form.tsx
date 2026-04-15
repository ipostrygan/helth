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
import { DatePickerField } from '@/components/ui/date-picker-field'
import { DialogFooter } from '@/components/ui/dialog'
import { useCreateSelfCareActivity } from './hooks/use-create-self-care-activity'
import { useEditSelfCareActivity } from './hooks/use-edit-self-care-activity'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date(),
  description: z.string().optional(),
  medication: z.string().min(1, 'Medication is required'),
  dosage: z.string().min(1, 'Dosage is required')
})

type FormValues = z.infer<typeof schema>

type SelfCareActivityFormProps = {
  profileId: string
  onClose: () => void
  selfCareActivity?: SelfCareActivity
}

const SelfCareActivityForm = ({ profileId, onClose, selfCareActivity }: SelfCareActivityFormProps) => {
  const isEditMode = !!selfCareActivity
  const { mutateAsync: createSelfCareActivity } = useCreateSelfCareActivity()
  const { mutateAsync: editSelfCareActivity } = useEditSelfCareActivity()

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<FormValues>({
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

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await editSelfCareActivity({ id: selfCareActivity.id, ...values })
    }
    else {
      await createSelfCareActivity({ ...values, userId: profileId })
    }
    onClose()
  }

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
        <Button type="submit" isPending={isSubmitting} disabled={!isDirty || !isValid}>
          {isEditMode ? 'Save' : 'Submit'}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default SelfCareActivityForm
