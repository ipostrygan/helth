'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTherapy } from '@/app/actions/therapies'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useEditTherapy = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateTherapy,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.therapies.all })
      toast.success('Therapy was successfully updated')
    },
    onError: () => {
      toast.error('Failed to update therapy')
    }
  })
}
