'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PaginatedResult } from '@/types'
import type { Therapy } from '@/lib/generated/prisma/client'
import { getTherapies } from '@/lib/api/therapies'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import { queryKeys } from '@/lib/query-keys'

export const useTherapies = (params: TherapiesQueryParams = {}) => {
  return useQuery<PaginatedResult<Therapy>>({
    queryKey: queryKeys.therapies.list(params),
    queryFn: () => getTherapies(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
