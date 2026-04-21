'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getAppointments } from '@/lib/api/appointments'
import type { AppointmentsQueryParams } from '@/app/(app)/appointments/types'
import { queryKeys } from '@/lib/query-keys'

export const useAppointments = (params: AppointmentsQueryParams = {}) => {
  return useQuery({
    queryKey: queryKeys.appointments.list(params),
    queryFn: () => getAppointments(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
