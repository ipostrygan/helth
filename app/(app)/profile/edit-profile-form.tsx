'use client'

import { ReactNode } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Field, FieldGroup } from '@/components/ui/field'
import { Button } from '@/components/ui/button'
import {
  Control,
  Controller,
  DefaultValues,
  FieldValues,
  useForm
} from 'react-hook-form'
import {
  AnimalProfile,
  HumanProfile,
  UserProfile
} from '../users/types/profile.types'
import { useEditProfile } from '../users/hooks/use-edit-profile'
import { getDirtyValues } from '@/lib/form'

type EditProfileFormProps = {
  data: UserProfile
  onClose: () => void
}

export type EditHumanProfileFormType = {
  firstName?: string
  lastName?: string
  weight?: number
  height?: number
  imageKey?: string
  shortName?: string
}

export type EditAnimalProfileFormType = {
  fullName?: string
  weight?: number
  imageKey?: string
  shortName?: string
}

export type EditProfileFormType
  = | EditHumanProfileFormType
    | EditAnimalProfileFormType

function ProfileForm<T extends FieldValues>({
  profileId,
  defaultValues,
  onClose,
  children
}: {
  profileId: string
  defaultValues: DefaultValues<T>
  onClose: () => void
  children: (control: Control<T>) => ReactNode
}) {
  const { mutateAsync, isPending } = useEditProfile(profileId)
  const {
    control,
    handleSubmit,
    formState: { isDirty, dirtyFields }
  } = useForm<T>({ defaultValues })

  const onSubmit = async (values: T) => {
    await mutateAsync(
      getDirtyValues(values, dirtyFields as Partial<Record<keyof T, unknown>>)
    )
    onClose()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FieldGroup>
        {children(control)}
        <Field orientation="horizontal" className="justify-end">
          <Button type="submit" disabled={!isDirty} isPending={isPending}>
            Submit
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}

const HumanForm = ({
  data,
  onClose
}: {
  data: HumanProfile
  onClose: () => void
}) => (
  <ProfileForm<EditHumanProfileFormType>
    profileId={data.id}
    defaultValues={{
      firstName: data.firstName,
      lastName: data.lastName,
      weight: data.weight,
      height: data.height ?? undefined,
      shortName: data.shortName ?? undefined
    }}
    onClose={onClose}
  >
    {control => (
      <>
        <Controller
          name="firstName"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="firstName">First name</Label>
              <Input id="firstName" {...field} />
            </Field>
          )}
        />
        <Controller
          name="lastName"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="lastName">Last name</Label>
              <Input id="lastName" {...field} />
            </Field>
          )}
        />
        <Controller
          name="shortName"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="shortName">Short name</Label>
              <Input id="shortName" {...field} />
            </Field>
          )}
        />
        <Controller
          name="weight"
          control={control}
          render={({ field: { onChange, ...field } }) => (
            <Field>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                {...field}
                onChange={e => onChange(e.target.valueAsNumber)}
              />
            </Field>
          )}
        />
        <Controller
          name="height"
          control={control}
          render={({ field: { onChange, ...field } }) => (
            <Field>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                {...field}
                onChange={e => onChange(e.target.valueAsNumber)}
              />
            </Field>
          )}
        />
      </>
    )}
  </ProfileForm>
)

const AnimalForm = ({
  data,
  onClose
}: {
  data: AnimalProfile
  onClose: () => void
}) => (
  <ProfileForm<EditAnimalProfileFormType>
    profileId={data.id}
    defaultValues={{
      fullName: data.fullName,
      weight: data.weight,
      shortName: data.shortName ?? undefined
    }}
    onClose={onClose}
  >
    {control => (
      <>
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" {...field} />
            </Field>
          )}
        />
        <Controller
          name="shortName"
          control={control}
          render={({ field }) => (
            <Field>
              <Label htmlFor="shortName">Short name</Label>
              <Input id="shortName" {...field} />
            </Field>
          )}
        />
        <Controller
          name="weight"
          control={control}
          render={({ field: { onChange, ...field } }) => (
            <Field>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                {...field}
                onChange={e => onChange(e.target.valueAsNumber)}
              />
            </Field>
          )}
        />
      </>
    )}
  </ProfileForm>
)

const EditProfileForm = ({ onClose, data }: EditProfileFormProps) => {
  if (data.profileType === 'Human') {
    return <HumanForm data={data} onClose={onClose} />
  }
  return <AnimalForm data={data} onClose={onClose} />
}

export default EditProfileForm
