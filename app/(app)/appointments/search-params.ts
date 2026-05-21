import { z } from 'zod'
import { baseQueryParamsSchema } from '@/lib/search-params'
import { AppointmentStatus, AppointmentType } from '@/lib/generated/prisma'

export const appointmentsQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'type', 'status', 'cost', 'specialistName', 'location'], { message: 'Invalid sort field' }),
  statuses: z.array(z.enum(Object.values(AppointmentStatus))).nullish(),
  types: z.array(z.enum(Object.values(AppointmentType))).nullish(),
  therapyId: z.string().nullish()
})
