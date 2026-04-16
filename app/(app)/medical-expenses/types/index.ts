import type { BaseQueryParams } from '@/types'

export type MedicalExpensesQueryParams = BaseQueryParams & {
  types?: string[] | null
  therapyId?: string | null
  appointmentId?: string | null
}
