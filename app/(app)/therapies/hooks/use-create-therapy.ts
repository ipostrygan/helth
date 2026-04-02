'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTherapy } from '@/app/actions/therapies'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useCreateTherapy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all })
      toast.success('Therapy was successfully created')
    },
    onError: () => {
      toast.error('Failed to create therapy')
    }
  })
}
