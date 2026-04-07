'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PaginatedResult } from '@/types/table'
import type { Therapy } from '@/lib/generated/prisma/client'
import { getTherapies, type TherapiesParams } from '@/lib/api/therapies'
import { queryKeys } from '@/lib/query-keys'

export const useTherapies = (params: TherapiesParams = {}) => {
  return useQuery<PaginatedResult<Therapy>>({
    queryKey: queryKeys.therapies.list(params),
    queryFn: () => getTherapies(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
