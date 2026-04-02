'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { ChevronDownIcon, LogOutIcon } from 'lucide-react'
import { UserProfile } from '../types/profile.types'
import ProfileListItem from './profile-list-item'
import { useProfile } from '../hooks/use-profile'
import SelectedProfile from './selected-profile'
import Link from 'next/link'
import { useActiveProfile } from '@/context/profile-context'
import { logout } from '@/app/actions/auth'
import { useTransition } from 'react'

type ProfileSwitcherProps = {
  profiles: UserProfile[]
}

const ProfileSwitcher = ({ profiles }: ProfileSwitcherProps) => {
  const { activeProfileId } = useActiveProfile()
  const { data: profile } = useProfile(activeProfileId)
  const [isPending, startTransition] = useTransition()

  const onLogout = () => {
    startTransition(async () => {
      await logout()
    })
  }

  if (!profile) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="inline-flex items-center gap-2 py-2 h-auto"
        >
          <SelectedProfile profile={profile} />
          <ChevronDownIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-50">
        <div className="text-center p-2">
          <Button asChild>
            <Link href="/profile">View profile</Link>
          </Button>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>Other profiles</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profiles.filter(p => p.id !== activeProfileId).map(profile => (
          <ProfileListItem profile={profile} key={profile.id} />
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 pb-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-destructive hover:text-destructive"
            onClick={onLogout}
            disabled={isPending}
          >
            <LogOutIcon className="size-4" />
            Logout
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default ProfileSwitcher
