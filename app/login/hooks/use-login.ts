"use client"

import { useMutation } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { login } from "@/app/actions/auth"

type LoginInput = {
  username: string
  password: string
}

export const useLogin = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: async (data: LoginInput) => {
      const result = await login(data)
      if (result.error) throw new Error(result.error)
      return result
    },
    onSuccess: () => {
      router.push("/")
    },
    onError: (error: Error) => {
      console.error("Login failed:", error.message)
    },
  })
}
