import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'

export const selfCareActivitiesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'medication', 'dosage'], { message: 'Invalid sort field' })
})
