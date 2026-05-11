import { NextRequest, NextResponse } from 'next/server'
import {
  createSearchParamsCache,
  parseAsArrayOf,
  parseAsString
} from 'nuqs/server'
import { getMedicalExpenses } from '../../actions/medical-expenses'
import { baseSearchParams } from '@/lib/search-params'
import { medicalExpensesQueryParamsSchema } from '@/app/(app)/medical-expenses/search-params'
import { validateQueryParams, actionErrorResponse } from '@/lib/api/utils'

const searchParamsCache = createSearchParamsCache({
  ...baseSearchParams(),
  types: parseAsArrayOf(parseAsString),
  therapyId: parseAsString,
  appointmentId: parseAsString
})

export async function GET(req: NextRequest) {
  const parsed = searchParamsCache.parse(
    Object.fromEntries(req.nextUrl.searchParams)
  )
  const validation = validateQueryParams(
    medicalExpensesQueryParamsSchema,
    parsed
  )
  if (!validation.success) {
    return validation.response
  }
  try {
    const result = await getMedicalExpenses(validation.data)
    return NextResponse.json(result)
  }
  catch (e) {
    return actionErrorResponse(e)
  }
}
