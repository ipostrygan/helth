"use client"

import { useQuery } from "@tanstack/react-query"
import { UserProfile } from "../types/profile.types"
import { getProfile } from "@/lib/api/users"

export const profileQueryKey = (id: string | null) =>
  ["profile", id] as const

export const useProfile = (id: string | null, initialData?: UserProfile | null) => {
  return useQuery<UserProfile | null>({
    queryKey: profileQueryKey(id),
    queryFn: () => getProfile(id!),
    initialData: initialData ?? undefined,
    enabled: !!id
  })
}
