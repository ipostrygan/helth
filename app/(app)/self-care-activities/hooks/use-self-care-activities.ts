'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PaginatedResult } from '@/types'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { getSelfCareActivities } from '@/lib/api/self-care-activities'
import type { SelfCareActivitiesQueryParams } from '@/app/(app)/self-care-activities/types'
import { queryKeys } from '@/lib/query-keys'

export const useSelfCareActivities = (params: SelfCareActivitiesQueryParams = {}) => {
  return useQuery<PaginatedResult<SelfCareActivity>>({
    queryKey: queryKeys.selfCareActivities.list(params),
    queryFn: () => getSelfCareActivities(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
