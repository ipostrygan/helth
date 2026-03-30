"use client"

import { useQuery } from "@tanstack/react-query"
import { UserProfile } from "../types/profile.types"
import { getProfile } from "@/lib/api/users"
import { queryKeys } from "@/lib/query-keys"

export const useProfile = (id: string | null, initialData?: UserProfile | null) => {
  return useQuery<UserProfile | null>({
    queryKey: queryKeys.profile.detail(id),
    queryFn: () => getProfile(id!),
    initialData: initialData ?? undefined,
    enabled: !!id
  })
}
