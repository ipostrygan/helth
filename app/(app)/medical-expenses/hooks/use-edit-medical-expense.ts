'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateExpense } from '@/app/actions/medical-expenses'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useEditMedicalExpense = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.medicalExpenses.all })
      toast.success('Medical expense was successfully updated')
    },
    onError: () => {
      toast.error('Failed to update medical expense')
    }
  })
}
