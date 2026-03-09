"use client"

import { createContext, useContext, useState } from "react"

const LAST_PROFILE_KEY = "lastProfileId"
const DEFAULT_ID = 1

type ProfileContextType = {
  activeProfileId: number
  setActiveProfileId: (id: number) => void
}

const ProfileContext = createContext<ProfileContextType>({
  activeProfileId: DEFAULT_ID,
  setActiveProfileId: () => {},
})

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<number>(
    () => Number((typeof window !== "undefined" ? localStorage.getItem(LAST_PROFILE_KEY) : null) ?? DEFAULT_ID)
  )

  const setActiveProfileId = (id: number) => {
    localStorage.setItem(LAST_PROFILE_KEY, String(id))
    setActiveProfileIdState(id)
  }

  return (
    <ProfileContext.Provider value={{ activeProfileId, setActiveProfileId }}>
      {children}
    </ProfileContext.Provider>
  )
}

export const useActiveProfile = () => useContext(ProfileContext)
