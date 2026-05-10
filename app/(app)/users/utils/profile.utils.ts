import { UserProfile } from '@/app/(app)/users/types/profile.types'

export function getProfileDisplayName(profile: UserProfile): string {
  return profile.profileType === 'Human' ? profile.firstName : profile.fullName
}
