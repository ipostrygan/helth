'use client'

import Modal from '@/components/modal'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useProfile } from '../users/hooks/use-profile'
import EditProfileForm from './edit-profile-form'
import PersonalInformation from './personal-information'
import { useActiveProfile } from '@/context/profile-context'
import ProfileSkeleton from './profile-skeleton'

const Profile = () => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { data: profile, isLoading } = useProfile(activeProfileId)

  if (isFamilyProfile) {
    return null
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (!profile) {
    return null
  }

  return (
    <div className="max-w-3xl m-auto">
      <div className="flex justify-end">
        <Modal
          open={editModalOpen}
          trigger={<Button variant="outline" onClick={() => setEditModalOpen(true)}>Edit profile</Button>}
          content={<EditProfileForm onClose={() => setEditModalOpen(false)} data={profile} />}
          title="Edit personal information"
          setOpen={setEditModalOpen}
        />
      </div>
      <PersonalInformation profile={profile} />
    </div>
  )
}

export default Profile
