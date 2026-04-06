'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ExpenseType } from '@/lib/generated/prisma'
import type { MedicalExpenseWithRelations } from '@/app/actions/medical-expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerField } from '@/components/ui/date-picker-field'
import { DialogFooter } from '@/components/ui/dialog'
import { EXPENSE_TYPE_LABELS } from './constants'
import { useCreateMedicalExpense } from './hooks/use-create-medical-expense'
import { useEditMedicalExpense } from './hooks/use-edit-medical-expense'
import { TherapyCombobox } from './components/therapy-combobox'

const schema = z.object({
  title: z.string().min(1, 'Name is required'),
  amount: z.number().positive('Amount must be greater than 0'),
  date: z.date(),
  type: z.enum(ExpenseType),
  description: z.string().optional(),
  therapyId: z.string().nullable().optional()
})

type FormValues = z.infer<typeof schema>

type MedicalExpenseFormProps = {
  profileId: string
  onClose: () => void
  expense?: MedicalExpenseWithRelations
}

const MedicalExpenseForm = ({ profileId, onClose, expense }: MedicalExpenseFormProps) => {
  const { mutateAsync: createExpense } = useCreateMedicalExpense()
  const { mutateAsync: editExpense } = useEditMedicalExpense()
  const isEditMode = !!expense

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty, isValid }
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          title: expense.title,
          amount: expense.amount,
          date: new Date(expense.date),
          type: expense.type,
          description: expense.description ?? undefined,
          therapyId: expense.therapyId ?? null
        }
      : { therapyId: null }
  })

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await editExpense({ id: expense.id, ...values })
    }
    else {
      await createExpense({ ...values, userId: profileId })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label htmlFor="title" required>Name</Label>
          <Input id="title" {...register('title')} aria-invalid={!!errors.title} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field>
          <Label htmlFor="amount" required>Amount (€)</Label>
          <Input id="amount" type="number" step="0.01" {...register('amount', { valueAsNumber: true })} aria-invalid={!!errors.amount} />
          <FieldError errors={[errors.amount]} />
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

        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <Label required>Type</Label>
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger aria-invalid={!!fieldState.error} className="w-full">
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(EXPENSE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          name="therapyId"
          control={control}
          render={({ field }) => (
            <Field>
              <Label>
                Therapy
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <TherapyCombobox
                profileId={profileId}
                value={field.value ?? null}
                onChange={field.onChange}
                selectedItem={expense?.therapy ?? null}
              />
            </Field>
          )}
        />

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

export default MedicalExpenseForm
