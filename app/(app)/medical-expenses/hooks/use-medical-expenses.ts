'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MedicalExpensePaginatedResult } from '@/app/actions/medical-expenses'
import { getMedicalExpenses, type MedicalExpensesParams } from '@/lib/api/medical-expenses'
import { queryKeys } from '@/lib/query-keys'

export type { MedicalExpensesParams }

export const useMedicalExpenses = (params: MedicalExpensesParams = {}) => {
  return useQuery<MedicalExpensePaginatedResult>({
    queryKey: queryKeys.medicalExpenses.list(params),
    queryFn: () => getMedicalExpenses(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
