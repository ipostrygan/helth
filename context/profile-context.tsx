"use client"

import { createContext, useContext, useState } from "react"

const LAST_PROFILE_KEY = "lastProfileId"
const DEFAULT_ID = "1"

type ProfileContextType = {
  activeProfileId: string
  setActiveProfileId: (id: string) => void
}

const ProfileContext = createContext<ProfileContextType>({
  activeProfileId: DEFAULT_ID,
  setActiveProfileId: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState(
    () => (typeof window !== "undefined" ? localStorage.getItem(LAST_PROFILE_KEY) : null) ?? DEFAULT_ID
  )

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
