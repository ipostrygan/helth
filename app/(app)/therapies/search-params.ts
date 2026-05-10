import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'

export const therapiesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['startDate', 'endDate', 'title', 'isActive']),
  isActive: z.array(z.string()).nullish()
})
