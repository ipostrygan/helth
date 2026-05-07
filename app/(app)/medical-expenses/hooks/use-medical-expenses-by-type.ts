'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getMedicalExpensesByType,
  type ExpensesByTypeItem,
  type ExpensesByTypeQuery
} from '@/app/actions/medical-expenses'
import { queryKeys } from '@/lib/query-keys'

export const useMedicalExpensesByType = (params: ExpensesByTypeQuery = {}) => {
  return useQuery<ExpensesByTypeItem[]>({
    queryKey: queryKeys.medicalExpenses.byType(params),
    queryFn: () => getMedicalExpensesByType(params),
    enabled: params.profileId !== null
  })
}
