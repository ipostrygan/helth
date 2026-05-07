'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getMedicalExpenses } from '@/lib/api/medical-expenses'
import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import { queryKeys } from '@/lib/query-keys'

export type { MedicalExpensesQueryParams }

export const useMedicalExpenses = (params: MedicalExpensesQueryParams = {}, scope?: keyof MedicalExpensesQueryParams) => {
  return useQuery({
    queryKey: queryKeys.medicalExpenses.list(params),
    queryFn: () => getMedicalExpenses(params),
    placeholderData: keepPreviousData,
    enabled: scope === 'profileId' ? params.profileId !== null : (scope ? !!params[scope] : false)
  })
}
