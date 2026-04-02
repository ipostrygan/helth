'use client'

import { useQuery } from '@tanstack/react-query'
import { getProfiles } from '@/lib/api/users'
import { queryKeys } from '@/lib/query-keys'

export const useProfiles = () => {
  return useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: getProfiles
  })
}
