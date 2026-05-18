'use client'

import { Modal } from '@/components/custom/modal'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { useProfile } from '../users/hooks/use-profile'
import EditProfileForm from './edit-profile-form'
import PersonalInformation from './personal-information'
import { useActiveProfile } from '@/context/profile-context'
import ProfileSkeleton from './profile-skeleton'
import FamilyMembers from './family-members'

const Profile = () => {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { data: profile, isLoading } = useProfile(activeProfileId)

  if (isFamilyProfile) {
    return (
      <div className="max-w-3xl m-auto">
        <FamilyMembers />
      </div>
    )
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
        <Button variant="outline" onClick={() => setEditModalOpen(true)}>Edit profile</Button>
        <Modal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          title="Edit personal information"
        >
          <EditProfileForm onClose={() => setEditModalOpen(false)} data={profile} />
        </Modal>
      </div>
      <PersonalInformation profile={profile} />
    </div>
  )
}

export default Profile
