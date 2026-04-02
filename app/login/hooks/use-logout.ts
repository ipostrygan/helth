'use client'

import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { logout } from '@/app/actions/auth'

export const useLogout = () => {
  const router = useRouter()

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      router.push('/login')
    }
  })
}
