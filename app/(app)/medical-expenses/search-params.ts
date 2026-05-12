import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'
import { ExpenseType } from '@/lib/generated/prisma'

export const medicalExpensesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'amount', 'type'], { message: 'Invalid sort field' }),
  types: z.array(z.enum(Object.values(ExpenseType))).nullish(),
  therapyId: z.string().nullish(),
  appointmentId: z.string().nullish()
})
