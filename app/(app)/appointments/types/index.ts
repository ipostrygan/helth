import type { BaseQueryParams } from '@/types'
import type { AppointmentStatus, AppointmentType } from '@/lib/generated/prisma'

export type AppointmentsQueryParams = BaseQueryParams & {
  statuses?: AppointmentStatus[] | null
  types?: AppointmentType[] | null
  therapyId?: string | null
}
