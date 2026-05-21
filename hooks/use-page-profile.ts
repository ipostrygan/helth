'use client'

import { useProfile } from '@/app/(app)/users/hooks/use-profile'
import { useActiveProfile } from '@/context/profile-context'

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
