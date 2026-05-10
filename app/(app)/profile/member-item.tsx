'use client'

import { UserProfile } from '../users/types/profile.types'
import { Button } from '@/components/ui/button'
import UserAvatar from '@/components/user-avatar'
import { useActiveProfile } from '@/context/profile-context'
import { useRouter } from 'next/navigation'

const MemberItem = ({ profile }: { profile: UserProfile }) => {
  const { setActiveProfileId } = useActiveProfile()
  const router = useRouter()

  const onView = () => {
    setActiveProfileId(profile.id)
    router.push('/profile')
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3">
      <UserAvatar profile={profile} className="size-10" />
      <div className="flex-1 min-w-0">
        {profile.profileType === 'Human'
          ? (
              <>
                <div className="font-medium truncate">
                  {profile.firstName}
                  {' '}
                  {profile.lastName}
                </div>
                {profile.shortName && <div className="text-sm text-muted-foreground truncate">{profile.shortName}</div>}
              </>
            )
          : (
              <>
                <div className="font-medium truncate">{profile.fullName}</div>
                {profile.shortName && <div className="text-sm text-muted-foreground truncate">{profile.shortName}</div>}
              </>
            )}
      </div>
      <span className="shrink-0 text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
        {profile.profileType}
      </span>
      <Button variant="outline" size="sm" onClick={onView}>
        View
      </Button>
    </div>
  )
}

export default MemberItem
