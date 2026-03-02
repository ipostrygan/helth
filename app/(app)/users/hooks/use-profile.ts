"use client"

import { useQuery } from "@tanstack/react-query"
import { UserProfile } from "../types/profile.types"

export const profileQueryKey = (id: string) =>
  ["profile", id] as const

export const useProfile = (id: string, initialData?: UserProfile | null) => {
  return useQuery<UserProfile | null>({
    queryKey: profileQueryKey(id),
    queryFn: () => fetch(`/api/users/${id}`).then(res => res.json()),
    initialData: initialData ?? undefined,
    enabled: !!id
  })
}

