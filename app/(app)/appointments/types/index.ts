import type { BaseQueryParams } from '@/types'

export type AppointmentsQueryParams = BaseQueryParams & {
  statuses?: string[]
  therapyId?: string
}
