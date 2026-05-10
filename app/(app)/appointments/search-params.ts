import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'

export const appointmentsQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'type', 'status', 'cost', 'specialistName', 'location']),
  statuses: z.array(z.string()).nullish(),
  therapyId: z.string().nullish()
})
