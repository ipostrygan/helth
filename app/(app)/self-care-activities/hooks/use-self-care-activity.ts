'use client'

import { useQuery } from '@tanstack/react-query'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { getSelfCareActivity } from '@/lib/api/self-care-activities'
import { queryKeys } from '@/lib/query-keys'

export const useSelfCareActivity = (id: string) => {
  return useQuery<SelfCareActivity>({
    queryKey: queryKeys.selfCareActivities.detail(id),
    queryFn: () => getSelfCareActivity(id),
    enabled: !!id
  })
}
