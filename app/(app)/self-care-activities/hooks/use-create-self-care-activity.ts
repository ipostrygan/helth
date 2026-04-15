'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSelfCareActivity } from '@/app/actions/self-care-activities'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useCreateSelfCareActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createSelfCareActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selfCareActivities.all })
      toast.success('Self-care activity was successfully created')
    },
    onError: () => {
      toast.error('Failed to create self-care activity')
    }
  })
}
