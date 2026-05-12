'use client'

import { useActiveProfile } from '@/context/profile-context'
import { useProfile } from '../users/hooks/use-profile'

export function usePageProfile() {
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)

  return {
    activeProfileId,
    isFamilyProfile,
    profile,
    profileId: isFamilyProfile ? undefined : activeProfileId,
    isReady: isFamilyProfile || !!profile
  }
}
