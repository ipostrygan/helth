'use client'

import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { PaginatedResult } from '@/types'
import type { SelfCareActivityWithUser } from '@/app/actions/self-care-activities'
import { getSelfCareActivities } from '@/lib/api/self-care-activities'
import type { BaseQueryParams } from '@/types'
import { queryKeys } from '@/lib/query-keys'

export const useSelfCareActivities = (params: BaseQueryParams = {}) => {
  return useQuery<PaginatedResult<SelfCareActivityWithUser>>({
    queryKey: queryKeys.selfCareActivities.list(params),
    queryFn: () => getSelfCareActivities(params),
    placeholderData: keepPreviousData,
    enabled: params.profileId !== null
  })
}
