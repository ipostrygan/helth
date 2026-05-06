'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PaginatedResult } from '@/types'
import type { SelfCareActivityWithUser } from '@/app/actions/self-care-activities'
import { getSelfCareActivities } from '@/lib/api/self-care-activities'
import type { SelfCareActivitiesQueryParams } from '@/app/(app)/self-care-activities/types'
import { queryKeys } from '@/lib/query-keys'

export const useSelfCareActivities = (params: SelfCareActivitiesQueryParams = {}) => {
  return useQuery<PaginatedResult<SelfCareActivityWithUser>>({
    queryKey: queryKeys.selfCareActivities.list(params),
    queryFn: () => getSelfCareActivities(params),
    placeholderData: keepPreviousData,
    enabled: !!params.profileId
  })
}
