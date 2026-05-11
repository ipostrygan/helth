import type { BaseQueryParams } from '@/types'
import type { AppointmentStatus } from '@/lib/generated/prisma'

export type AppointmentsQueryParams = BaseQueryParams & {
  statuses?: AppointmentStatus[] | null
  therapyId?: string | null
}
