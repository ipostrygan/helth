'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { AppointmentType, AppointmentStatus } from '@/lib/generated/prisma'
import type { Appointment } from '@/lib/generated/prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Field, FieldError, FieldGroup } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePickerField } from '@/components/ui/date-picker-field'
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS } from '../constants'
import { TherapyCombobox } from '@/app/(app)/medical-expenses/components/therapy-combobox'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  date: z.date(),
  endDate: z.date().optional(),
  type: z.enum(AppointmentType),
  status: z.enum(AppointmentStatus),
  cost: z.number().nonnegative().optional(),
  doctorName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  therapyId: z.string().nullable().optional()
})

type FormValues = z.infer<typeof schema>

export type AppointmentFormValues = FormValues

type AppointmentFormProps = {
  profileId: string
  appointment?: Appointment & { cost?: number | null }
  onSubmit: (values: FormValues) => Promise<void>
}

const AppointmentForm = ({ profileId, appointment, onSubmit }: AppointmentFormProps) => {
  const router = useRouter()
  const isEditMode = !!appointment

  const { control, register, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: appointment
      ? {
          title: appointment.title,
          description: appointment.description ?? undefined,
          date: new Date(appointment.date),
          type: appointment.type,
          status: appointment.status,
          cost: appointment.cost ?? undefined,
          doctorName: appointment.doctorName ?? undefined,
          location: appointment.location ?? undefined,
          notes: appointment.notes ?? undefined,
          therapyId: appointment.therapyId ?? null
        }
      : { status: AppointmentStatus.Scheduled, therapyId: null, cost: undefined }
  })

  return (
    <div className="flex flex-col w-full flex-1">
      <div className="flex-1 p-3 xs:p-6 w-full">
        <form id="appointment-form" onSubmit={handleSubmit(onSubmit)}>
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
                      {Object.entries(APPOINTMENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              name="status"
              control={control}
              render={({ field, fieldState }) => (
                <Field>
                  <Label>Status</Label>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger aria-invalid={!!fieldState.error} className="w-full">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(APPOINTMENT_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field>
              <Label htmlFor="cost">Cost</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                min="0"
                {...register('cost', { valueAsNumber: true })}
                aria-invalid={!!errors.cost}
              />
              <FieldError errors={[errors.cost]} />
            </Field>

            <Field>
              <Label htmlFor="doctorName">Doctor</Label>
              <Input id="doctorName" {...register('doctorName')} />
            </Field>

            <Field>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register('location')} />
            </Field>

            <Field>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register('notes')} />
            </Field>

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
                  />
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
            onClick={() => router.push(isEditMode ? `/appointments/${appointment.id}` : '/appointments')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="appointment-form"
            isPending={isSubmitting}
            disabled={!isDirty || !isValid}
          >
            {isEditMode ? 'Save' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentForm
