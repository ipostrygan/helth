"use client"

import { useProfile } from "../users/hooks/use-profile"
import { UserProfile } from "../users/types/profile.types"

const Appointments = ({ id, initialProfile }: { id: string | null, initialProfile?: UserProfile | null }) => {
  const { data: profile } = useProfile(id, initialProfile)

  if (!profile) {
    return null
  }

  return (
    <div>
      <h1>{`${profile.firstName}'s Appointments`}</h1>
    </div>
  )
}

export default Appointments
