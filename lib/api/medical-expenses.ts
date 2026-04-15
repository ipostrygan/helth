import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import type { MedicalExpensePaginatedResult, MedicalExpenseWithRelations } from '@/app/actions/medical-expenses'
import { buildSearchParams, fetchOne, deleteResource } from './utils'

const BASE = '/api/medical-expenses'

export async function getMedicalExpenses(
  params: MedicalExpensesQueryParams
): Promise<MedicalExpensePaginatedResult> {
  const sp = buildSearchParams(params, {
    types: params.types?.join(','),
    therapyId: params.therapyId,
    appointmentId: params.appointmentId
  })
  const res = await fetch(`${BASE}?${sp}`)
  return res.json()
}

export const getMedicalExpense = (id: string) =>
  fetchOne<MedicalExpenseWithRelations>(`${BASE}/${id}`)

export const deleteMedicalExpense = (id: string) =>
  deleteResource(`${BASE}/${id}`)
