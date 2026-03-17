"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getAllProfiles } from "@/app/actions/profile"

const LAST_PROFILE_KEY = "lastProfileId"

type ProfileContextType = {
  activeProfileId: string | null
  setActiveProfileId: (id: string) => void
}

const ProfileContext = createContext<ProfileContextType>({
  activeProfileId: null,
  setActiveProfileId: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem(LAST_PROFILE_KEY)
    if (stored) {
      setActiveProfileIdState(stored)
      return
    }

    getAllProfiles().then(profiles => {
      const primary = profiles.find(p => p.isPrimaryUser) ?? profiles[0]
      if (primary) {
        localStorage.setItem(LAST_PROFILE_KEY, primary.id)
        setActiveProfileIdState(primary.id)
      }
    })
  }, [activeProfileId])

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
