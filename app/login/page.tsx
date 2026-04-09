'use client'

import { Button } from '@/components/ui/button'
import { FieldGroup, Field } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTransition } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'next/navigation'
import { login } from '@/app/actions/auth'
import { toast } from 'sonner'
import Image from 'next/image'

type LoginFormType = {
  username: string
  password: string
}

const LoginPage = () => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const {
    control,
    handleSubmit,
    formState: { isDirty, isValid }
  } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = (data: LoginFormType) => {
    startTransition(async () => {
      const result = await login(data)
      if (result.error) {
        toast.error(`Login failed: ${result.error}`)
        return
      }
      router.push('/')
    })
  }

  return (
    <div className="container max-w-xl min-h-screen flex flex-col justify-center m-auto max-sm:px-6">
      <div className="relative w-full h-42 rounded-xl mb-6 overflow-hidden">
        <Image
          src="/images/logo-rectangle.svg"
          alt="Health Tracker"
          fill
          className="object-cover"
        />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup>
          <Controller
            name="username"
            control={control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...field} />
              </Field>
            )}
          />
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <Field>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...field} autoComplete="new-password" />
              </Field>
            )}
          />
          <Field orientation="horizontal" className="justify-end">
            <Button
              type="submit"
              disabled={!isDirty || !isValid || isPending}
              isPending={isPending}
            >
              Login
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

export default LoginPage
