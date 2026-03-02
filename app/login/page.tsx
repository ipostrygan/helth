"use client"

import { Button } from "@/components/ui/button"
import { FieldGroup, Field } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { redirect } from "next/navigation"
import { Controller, useForm } from "react-hook-form"
import { useLogin } from "./hooks/use-login"

type LoginFormType = {
  username: string
  password: string
}

const LoginPage = () => {
  const { mutate } = useLogin()

  const {
    control,
    handleSubmit,
    formState: { isValid }
  } = useForm({
    defaultValues: {
      username: '',
      password: ''
    }
  })

  const onSubmit = (data: LoginFormType) => {
    mutate(data)
  }

  return (
    <div className="container max-w-xl min-h-screen flex flex-col justify-center m-auto">
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
             render={({ field }) =>
               <Field>
                 <Label htmlFor="password">Password</Label>
                 <Input id="password" type="password" {...field} autoComplete="new-password"/>
               </Field>
            }
           />
           <Field orientation="horizontal" className="justify-end">
             <Button type="submit" disabled={!isValid}>Login</Button>
           </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

export default LoginPage