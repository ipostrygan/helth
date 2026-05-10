import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'

export const medicalExpensesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'amount', 'type']),
  types: z.array(z.string()).nullish(),
  therapyId: z.string().nullish(),
  appointmentId: z.string().nullish()
})
