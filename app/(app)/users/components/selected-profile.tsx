import { UserProfile } from '../types/profile.types'
import { getProfileDisplayName } from '../utils/profile.utils'
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
