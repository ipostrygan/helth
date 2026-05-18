'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveProfile } from '@/context/profile-context'
import { FamilyMemberSelect } from '@/components/custom/family-member-select'
import TherapyForm, { type TherapyFormValues } from '../components/therapy-form'
import { useCreateTherapy } from '../hooks/use-create-therapy'

const CreateTherapyPage = () => {
  const router = useRouter()
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { mutateAsync: createTherapy } = useCreateTherapy()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  if (!isFamilyProfile && !activeProfileId) return null

  const userId = isFamilyProfile ? selectedUserId : activeProfileId

  const onSubmit = async (values: TherapyFormValues) => {
    await createTherapy({ ...values, userId: userId! })
    router.push('/therapies')
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="px-3 xs:px-6 pt-6 space-y-4">
        <h1 className="text-2xl font-semibold">Add Therapy</h1>
        {isFamilyProfile && (
          <FamilyMemberSelect value={selectedUserId} onChange={setSelectedUserId} />
        )}
      </div>
      <TherapyForm
        onClose={() => router.push('/therapies')}
        onSubmit={onSubmit}
        isSubmitDisabled={isFamilyProfile && !selectedUserId}
      />
    </div>
  )
}

export default CreateTherapyPage
