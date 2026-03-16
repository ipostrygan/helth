"use client"

import { useState } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { ExpenseType } from "@/lib/generated/prisma/enums"
import type { MedicalExpense } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { DialogFooter } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { EXPENSE_TYPE_LABELS } from "./constants"
import { useCreateMedicalExpense } from "./hooks/use-create-medical-expense"
import { useEditMedicalExpense } from "./hooks/use-edit-medical-expense"

const schema = z.object({
  title: z.string().min(1, "Name is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  date: z.date(),
  type: z.enum(ExpenseType),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

type MedicalExpenseFormProps = {
  profileId: string
  onClose: () => void
  expense?: MedicalExpense
}

const MedicalExpenseForm = ({ profileId, onClose, expense }: MedicalExpenseFormProps) => {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const { mutateAsync: createExpense } = useCreateMedicalExpense()
  const { mutateAsync: editExpense } = useEditMedicalExpense()
  const isEditMode = !!expense

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: expense
      ? {
          title: expense.title,
          amount: expense.amount,
          date: new Date(expense.date),
          type: expense.type,
          description: expense.description ?? undefined,
        }
      : undefined,
  })

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await editExpense({ id: expense.id, ...values })
    } else {
      await createExpense({ ...values, userId: profileId })
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Field>
          <Label htmlFor="title">Name</Label>
          <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
          <FieldError errors={[errors.title]} />
        </Field>

        <Field>
          <Label htmlFor="amount">Amount (€)</Label>
          <Input id="amount" type="number" step="0.01" {...register("amount", { valueAsNumber: true })} aria-invalid={!!errors.amount} />
          <FieldError errors={[errors.amount]} />
        </Field>

        <Controller
          name="date"
          control={control}
          render={({ field }) => (
            <Field>
              <Label>Date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    aria-invalid={!!errors.date}
                    className={cn(
                      "w-full justify-start gap-2 font-normal",
                      !field.value && "text-muted-foreground",
                      errors.date && "border-destructive"
                    )}
                  >
                    <CalendarIcon className="size-4 shrink-0" />
                    {field.value ? format(field.value, "MMM d, yyyy") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      field.onChange(date)
                      setCalendarOpen(false)
                    }}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
              <FieldError errors={[errors.date]} />
            </Field>
          )}
        />

        <Controller
          name="type"
          control={control}
          render={({ field, fieldState }) => (
            <Field>
              <Label>Type</Label>
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

        <Field>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} {...register("description")} />
        </Field>
      </FieldGroup>

      <DialogFooter className="mt-6">
        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isPending={isSubmitting}>
          {isEditMode ? "Save" : "Submit"}
        </Button>
      </DialogFooter>
    </form>
  )
}

export default MedicalExpenseForm
