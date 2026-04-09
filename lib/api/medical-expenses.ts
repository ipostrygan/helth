import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import type { MedicalExpensePaginatedResult, MedicalExpenseWithRelations } from '@/app/actions/medical-expenses'

export async function getMedicalExpenses(
  params: MedicalExpensesQueryParams
): Promise<MedicalExpensePaginatedResult> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = 'date',
    sortDirection = 'desc',
    search = '',
    dateFrom,
    dateTo,
    types,
    therapyId,
    appointmentId
  } = params

  const searchParams = new URLSearchParams({
    ...(profileId ? { profileId } : {}),
    page: String(page),
    pageSize: String(pageSize),
    sortField,
    sortDirection,
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    ...(types && types.length > 0 ? { types: types.join(',') } : {}),
    ...(therapyId ? { therapyId } : {}),
    ...(appointmentId ? { appointmentId } : {})
  })

  const res = await fetch(`/api/medical-expenses?${searchParams}`)
  return res.json()
}

export async function deleteMedicalExpense(id: string): Promise<void> {
  const res = await fetch(`/api/medical-expenses/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete expense')
}

export async function getMedicalExpense(id: string): Promise<MedicalExpenseWithRelations> {
  const res = await fetch(`/api/medical-expenses/${id}`)
  if (!res.ok) throw new Error('Failed to fetch expense')
  return res.json()
}
