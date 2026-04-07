'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PaginatedResult } from '@/types/table'
import type { Appointment } from '@/lib/generated/prisma/client'
import { getAppointments, type AppointmentsParams } from '@/lib/api/appointments'
import { queryKeys } from '@/lib/query-keys'

export type { AppointmentsParams }

export const useAppointments = (params: AppointmentsParams = {}) => {
  return useQuery<PaginatedResult<Appointment>>({
    queryKey: queryKeys.appointments.list(params),
    queryFn: () => getAppointments(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
