'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChangeEvent } from 'react'
import { uploadProfileImage } from '@/lib/api/users'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export function useUploadFile(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]

      if (!file) throw new Error('No file provided')

      return uploadProfileImage(id, file)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.all })
      toast.success('Profile photo was successfully uploaded')
    },
    onError: () => {
      toast.error('Failed to upload profile photo')
    }
  })
}
