import { UserProfile } from '@/app/(app)/users/types/profile.types'
import type { ProfileSummary } from '@/types'

export function getProfileDisplayName(profile: UserProfile): string {
  return profile.profileType === 'Human' ? profile.firstName : profile.fullName
}

export function profileLabel(user: ProfileSummary): string {
  return user.profileType === 'Human' ? (user.firstName ?? '') : (user.shortName ?? '')
}
