'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProfiles } from '@/lib/api/users'
import { queryKeys } from '@/lib/query-keys'

const LAST_PROFILE_KEY = 'lastProfileId'

type ProfileContextType = {
  activeProfileId: string | null
  setActiveProfileId: (id: string) => void
}

const ProfileContext = createContext<ProfileContextType>({
  activeProfileId: null,
  setActiveProfileId: () => {}
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(LAST_PROFILE_KEY)
    if (stored) setActiveProfileIdState(stored)
  }, [])

  const { data: profiles } = useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: getProfiles,
    enabled: !activeProfileId
  })

  useEffect(() => {
    if (activeProfileId || !profiles) return
    const primary = profiles.find(p => p.isPrimaryUser) ?? profiles[0]
    if (primary) {
      localStorage.setItem(LAST_PROFILE_KEY, primary.id)
      setActiveProfileIdState(primary.id)
    }
  }, [profiles, activeProfileId])

  const setActiveProfileId = (id: string) => {
    localStorage.setItem(LAST_PROFILE_KEY, id)
    setActiveProfileIdState(id)
  }

  return (
    <ProfileContext.Provider value={{ activeProfileId, setActiveProfileId }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useActiveProfile = () => useContext(ProfileContext)
