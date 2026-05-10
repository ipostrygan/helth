'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteSelfCareActivity } from '@/lib/api/self-care-activities'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useDeleteSelfCareActivity = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteSelfCareActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.selfCareActivities.all })
      toast.success('Self-care activity was successfully deleted')
    },
    onError: () => {
      toast.error('Failed to delete self-care activity')
    }
  })
}
