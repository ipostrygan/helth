'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateSelfCareActivity } from '@/app/actions/self-care-activities'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useEditSelfCareActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSelfCareActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selfCareActivities.all })
      toast.success('Self-care activity was successfully updated')
    },
    onError: () => {
      toast.error('Failed to update self-care activity')
    }
  })
}
