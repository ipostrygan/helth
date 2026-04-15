import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server'
import { format, subMonths } from 'date-fns'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { SORT_DIRECTIONS } from '@/types'
import { z } from 'zod'

const dateParam = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be yyyy-MM-dd').optional()

export const baseQueryParamsSchema = z.object({
  profileId: z.string().optional(),
  page: z.number().int().positive('must be a positive integer'),
  pageSize: z.number().int().positive('must be a positive integer').max(100, 'must be ≤ 100'),
  sortField: z.string(),
  sortDirection: z.enum(SORT_DIRECTIONS),
  search: z.string(),
  dateFrom: dateParam,
  dateTo: dateParam
})

export const appointmentsQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'type', 'status', 'cost', 'doctorName', 'location']),
  statuses: z.array(z.string()).optional(),
  therapyId: z.string().optional()
})

export const medicalExpensesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'amount', 'type']),
  types: z.array(z.string()).optional(),
  therapyId: z.string().optional(),
  appointmentId: z.string().optional()
})

export const therapiesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['startDate', 'endDate', 'title', 'isActive', 'therapistName']),
  isActive: z.array(z.string()).optional()
})

export const selfCareActivitiesQueryParamsSchema = baseQueryParamsSchema.extend({
  sortField: z.enum(['date', 'title', 'medication', 'dosage'])
})

export const defaultDateFrom = format(subMonths(new Date(), 4), 'yyyy-MM-dd')
export const defaultDateTo = format(new Date(), 'yyyy-MM-dd')

export const baseFilterParsers = (defaultSortField = 'date') => ({
  page: parseAsInteger.withDefault(DEFAULT_PAGE),
  pageSize: parseAsInteger.withDefault(DEFAULT_PAGE_SIZE),
  sortField: parseAsString.withDefault(defaultSortField),
  sortDirection: parseAsStringEnum([...SORT_DIRECTIONS]).withDefault('desc'),
  search: parseAsString.withDefault(''),
  dateFrom: parseAsString.withDefault(defaultDateFrom),
  dateTo: parseAsString.withDefault(defaultDateTo)
})

export const baseSearchParams = (defaultSortField = 'date') => ({
  profileId: parseAsString,
  ...baseFilterParsers(defaultSortField),
  dateFrom: parseAsString,
  dateTo: parseAsString
})
