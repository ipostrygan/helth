'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { MedicalExpensePaginatedResult } from '@/app/actions/medical-expenses'
import { getMedicalExpenses } from '@/lib/api/medical-expenses'
import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import { queryKeys } from '@/lib/query-keys'

export type { MedicalExpensesQueryParams }

export const useMedicalExpenses = (params: MedicalExpensesQueryParams = {}) => {
  return useQuery<MedicalExpensePaginatedResult>({
    queryKey: queryKeys.medicalExpenses.list(params),
    queryFn: () => getMedicalExpenses(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
