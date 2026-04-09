import type { BaseQueryParams } from '@/types'

export type MedicalExpensesQueryParams = BaseQueryParams & {
  types?: string[]
  therapyId?: string
  appointmentId?: string
}
