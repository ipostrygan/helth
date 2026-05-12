import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'

export const therapiesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['startDate', 'endDate', 'title', 'isActive'], { message: 'Invalid sort field' }),
  isActive: z.array(z.enum(['true', 'false'])).nullish()
})
