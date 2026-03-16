"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup } from "@/components/ui/field"
import { Button } from "@/components/ui/button"
import { Controller, useForm } from "react-hook-form"
import { UserProfile } from "../users/types/profile.types"
import { useEditProfile } from "../users/hooks/use-edit-profile"
import { getDirtyValues } from "@/utils/form"

type EditProfileFormProps = {
  data: UserProfile
  onClose: () => void
}

export type EditProfileFormType = {
  weight?: number
  height?: number
  imageKey?: string
  shortName?: string
}

const EditProfileForm = ({ onClose, data }: EditProfileFormProps) => {
  const { mutateAsync, isPending } = useEditProfile(data.id)

  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields }
  } = useForm<EditProfileFormType>({
    defaultValues: {
      weight: data.weight,
      height: data.height ?? undefined,
      shortName: data.shortName ?? undefined
    }
  })

  const onSubmit = async (data: EditProfileFormType) => {
    await mutateAsync(getDirtyValues(data, dirtyFields))
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="shortName"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="shortname">Shortname</Label>
              <Input id="shortname" {...field} />
            </Field>
          )}
        />
        <Controller
          name="weight"
          control={control}
          render={({ field }) =>
            <Field>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" {...field} />
            </Field>
          }
        />
        <Controller
          name="height"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="height">Height (cm)</Label>
              <Input id="height" type="number" {...field} />
            </Field>
          )}
        />
        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={!isDirty} isPending={isPending}>Submit</Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

export default EditProfileForm
