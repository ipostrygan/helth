"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { AppointmentType, AppointmentStatus } from "@/lib/generated/prisma"
import type { Appointment } from "@/lib/generated/prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldError, FieldGroup } from "@/components/ui/field"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerField } from "@/components/ui/date-picker-field"
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS } from "../constants"
import { useCreateAppointment } from "../hooks/use-create-appointment"
import { useEditAppointment } from "../hooks/use-edit-appointment"
import { TherapyCombobox } from "@/app/(app)/medical-expenses/components/therapy-combobox"

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  date: z.date(),
  endDate: z.date().optional(),
  type: z.enum(AppointmentType),
  status: z.enum(AppointmentStatus),
  doctorName: z.string().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  therapyId: z.string().nullable().optional(),
})

type FormValues = z.infer<typeof schema>

type AppointmentFormProps = {
  profileId: string
  appointment?: Appointment
}

const AppointmentForm = ({ profileId, appointment }: AppointmentFormProps) => {
  const router = useRouter()
  const isEditMode = !!appointment
  const { mutateAsync: createAppointment } = useCreateAppointment()
  const { mutateAsync: editAppointment } = useEditAppointment()

  const { control, register, handleSubmit, formState: { errors, isSubmitting, isDirty, isValid } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: appointment
      ? {
          title: appointment.title,
          description: appointment.description ?? undefined,
          date: new Date(appointment.date),
          type: appointment.type,
          status: appointment.status,
          doctorName: appointment.doctorName ?? undefined,
          location: appointment.location ?? undefined,
          notes: appointment.notes ?? undefined,
          therapyId: appointment.therapyId ?? null,
        }
      : { status: AppointmentStatus.Scheduled, therapyId: null },
  })

  const onSubmit = async (values: FormValues) => {
    if (isEditMode) {
      await editAppointment({ id: appointment.id, ...values })
    } else {
      await createAppointment({ ...values, userId: profileId })
    }
    router.push("/appointments")
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      <div className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <form id="appointment-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Field>
              <Label htmlFor="title">Title</Label>
              <Input id="title" {...register("title")} aria-invalid={!!errors.title} />
              <FieldError errors={[errors.title]} />
            </Field>

            <Field>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={3} {...register("description")} />
            </Field>

            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePickerField
                  label="Date"
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
                  <Label>Type</Label>
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
              <Label htmlFor="doctorName">Doctor</Label>
              <Input id="doctorName" {...register("doctorName")} />
            </Field>

            <Field>
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} />
            </Field>

            <Field>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} {...register("notes")} />
            </Field>

            <Controller
              name="therapyId"
              control={control}
              render={({ field }) => (
                <Field>
                  <Label>Therapy <span className="text-muted-foreground text-xs">(optional)</span></Label>
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

      <div className="sticky bottom-0 border-t bg-background px-6 py-4">
        <div className="max-w-2xl mx-auto flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/appointments")}
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
            {isEditMode ? "Save" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AppointmentForm
