'use client'

import { useQuery } from '@tanstack/react-query'
import { getAppointment, type AppointmentWithDocuments } from '@/lib/api/appointments'
import { queryKeys } from '@/lib/query-keys'

export const useAppointment = (id: string) => {
  return useQuery<AppointmentWithDocuments>({
    queryKey: queryKeys.appointments.detail(id),
    queryFn: () => getAppointment(id),
    enabled: !!id
  })
}
