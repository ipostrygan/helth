import { UserProfile, getProfileDisplayName } from '../types/profile.types'
import UserAvatar from '@/components/user-avatar'

interface SelectedProfile {
  profile: UserProfile
}

const SelectedProfile = ({ profile }: SelectedProfile) => {
  return (
    <span className="flex items-center gap-3">
      <UserAvatar profile={profile} className="size-8" />
      <span>{getProfileDisplayName(profile)}</span>
    </span>
  )
}

export default SelectedProfile
