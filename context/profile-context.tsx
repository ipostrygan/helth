'use client'

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react'
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

function subscribeToStorage(callback: () => void) {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

function getStoredSnapshot() {
  return localStorage.getItem(LAST_PROFILE_KEY)
}

function getStoredServerSnapshot() {
  return null
}

function writeStorage(value: string) {
  localStorage.setItem(LAST_PROFILE_KEY, value)
  window.dispatchEvent(new StorageEvent('storage', { key: LAST_PROFILE_KEY, newValue: value }))
}

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const storedValue = useSyncExternalStore(subscribeToStorage, getStoredSnapshot, getStoredServerSnapshot)

  const storedProfileId = storedValue && storedValue !== FAMILY_PROFILE_ID ? storedValue : null
  const isFamilyProfile = storedValue === FAMILY_PROFILE_ID

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
      writeStorage(defaultProfileId)
    }
  }, [defaultProfileId])

  return (
    <ProfileContext.Provider
      value={{
        activeProfileId,
        isFamilyProfile,
        setActiveProfileId: writeStorage,
        selectFamilyProfile: () => writeStorage(FAMILY_PROFILE_ID)
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export const useActiveProfile = () => useContext(ProfileContext)
