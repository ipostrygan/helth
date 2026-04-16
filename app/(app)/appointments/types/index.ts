import type { BaseQueryParams } from '@/types'

export type AppointmentsQueryParams = BaseQueryParams & {
  statuses?: string[] | null
  therapyId?: string | null
}
