import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import type { MedicalExpensePaginatedResult } from '@/app/actions/medical-expenses'
import type { MedicalExpense } from '@/lib/generated/prisma'
import { buildSearchParams, fetchOne, deleteResource } from './utils'

const BASE = '/api/medical-expenses'

export async function getMedicalExpenses(
  params: MedicalExpensesQueryParams
): Promise<MedicalExpensePaginatedResult> {
  const sp = buildSearchParams(params, {
    types: params.types,
    therapyId: params.therapyId,
    appointmentId: params.appointmentId
  })
  const res = await fetch(`${BASE}?${sp}`)
  if (!res.ok) throw new Error(`Failed to fetch medical expenses: ${res.status}`)
  return res.json()
}

export const getMedicalExpense = (id: string) =>
  fetchOne<MedicalExpense>(`${BASE}/${id}`)

export const deleteMedicalExpense = (id: string) =>
  deleteResource(`${BASE}/${id}`)
