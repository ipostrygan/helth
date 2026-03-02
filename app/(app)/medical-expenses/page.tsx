"use client"

import { useActiveProfile } from "@/context/profile-context"
import { useProfile } from "../users/hooks/use-profile"

const MedicalExpenses = () => {
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)

  if (!profile) {
    return null
  }

  return (
    <div>
      <h1>{`${profile.firstName}'s medical expenses`}</h1>
    </div>
  )
}

export default MedicalExpenses
