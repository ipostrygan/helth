import type { BaseQueryParams } from '@/types'
import type { ExpenseType } from '@/lib/generated/prisma'

export type MedicalExpensesQueryParams = BaseQueryParams & {
  types?: ExpenseType[] | null
  therapyId?: string | null
  appointmentId?: string | null
}
