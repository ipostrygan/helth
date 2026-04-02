'use client'

import { useQuery } from '@tanstack/react-query'
import { getTherapy, type TherapyWithDocuments } from '@/lib/api/therapies'
import { queryKeys } from '@/lib/query-keys'

export const useTherapy = (id: string) => {
  return useQuery<TherapyWithDocuments>({
    queryKey: queryKeys.therapies.detail(id),
    queryFn: () => getTherapy(id),
    enabled: !!id
  })
}
