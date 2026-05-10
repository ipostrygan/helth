'use client'

import { UserProfile } from '../types/profile.types'
import { getProfileDisplayName } from '../utils/profile.utils'
import UserAvatar from '@/components/user-avatar'
import { useActiveProfile } from '@/context/profile-context'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'

const ProfileListItem = ({ profile }: { profile: UserProfile }) => {
  const { setActiveProfileId } = useActiveProfile()

  return (
    <DropdownMenuItem onClick={() => setActiveProfileId(profile.id)} className="flex gap-3">
      <UserAvatar profile={profile} className="size-8" />
      <div>
        <div>{getProfileDisplayName(profile)}</div>
        <div className="text-xs">{profile.shortName}</div>
      </div>
    </DropdownMenuItem>
  )
}

export default ProfileListItem
