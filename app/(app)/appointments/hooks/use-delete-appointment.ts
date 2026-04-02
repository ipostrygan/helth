'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteAppointment } from '@/lib/api/appointments'
import { queryKeys } from '@/lib/query-keys'
import { toast } from 'sonner'

export const useDeleteAppointment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteAppointment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.appointments.all })
      toast.success('Appointment was successfully deleted')
    },
    onError: () => {
      toast.error('Failed to delete appointment')
    }
  })
}
