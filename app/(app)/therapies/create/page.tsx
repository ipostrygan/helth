'use client'

import { useActiveProfile } from '@/context/profile-context'
import TherapyForm from '../components/therapy-form'

const CreateTherapyPage = () => {
  const { activeProfileId } = useActiveProfile()

  if (!activeProfileId) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold">Add Therapy</h1>
      </div>
      <TherapyForm profileId={activeProfileId} />
    </div>
  )
}

export default CreateTherapyPage
