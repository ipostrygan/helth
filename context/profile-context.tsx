'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getProfiles } from '@/lib/api/users'
import { queryKeys } from '@/lib/query-keys'

const LAST_PROFILE_KEY = 'lastProfileId'
export const FAMILY_PROFILE_ID = '__family__'

type ProfileContextType = {
  activeProfileId: string | null
  isFamilyProfile: boolean
  setActiveProfileId: (id: string) => void
  selectFamilyProfile: () => void
}

const ProfileContext = createContext<ProfileContextType>({
  activeProfileId: null,
  isFamilyProfile: false,
  setActiveProfileId: () => {},
  selectFamilyProfile: () => {}
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [storedProfileId, setStoredProfileId] = useState<string | null>(null)
  const [isFamilyProfile, setIsFamilyProfile] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(LAST_PROFILE_KEY)
    if (stored === FAMILY_PROFILE_ID) {
      setIsFamilyProfile(true)
    } else if (stored) {
      setStoredProfileId(stored)
    }
  }, [])

  const isStoredReady = isFamilyProfile || !!storedProfileId

  const { data: profiles } = useQuery({
    queryKey: queryKeys.profile.all,
    queryFn: getProfiles,
    enabled: !isStoredReady
  })

  const defaultProfile = !isStoredReady && profiles
    ? (profiles.find(p => p.isPrimaryUser) ?? profiles[0]) ?? null
    : null
  const defaultProfileId = defaultProfile?.id ?? null

  const activeProfileId = storedProfileId ?? defaultProfileId

  useEffect(() => {
    if (defaultProfileId) {
      localStorage.setItem(LAST_PROFILE_KEY, defaultProfileId)
    }
  }, [defaultProfileId])

  const setActiveProfileId = (id: string) => {
    localStorage.setItem(LAST_PROFILE_KEY, id)
    setStoredProfileId(id)
    setIsFamilyProfile(false)
  }

  const selectFamilyProfile = () => {
    localStorage.setItem(LAST_PROFILE_KEY, FAMILY_PROFILE_ID)
    setStoredProfileId(null)
    setIsFamilyProfile(true)
  }

  return (
    <ProfileContext.Provider value={{ activeProfileId, isFamilyProfile, setActiveProfileId, selectFamilyProfile }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useActiveProfile = () => useContext(ProfileContext)
