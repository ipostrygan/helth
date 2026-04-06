'use client'

import { useRouter } from 'next/navigation'
import { useActiveProfile } from '@/context/profile-context'
import TherapyForm, { type TherapyFormValues } from '../components/therapy-form'
import { useCreateTherapy } from '../hooks/use-create-therapy'

const CreateTherapyPage = () => {
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { mutateAsync: createTherapy } = useCreateTherapy()

  if (!activeProfileId) return null

  const onSubmit = async (values: TherapyFormValues) => {
    await createTherapy({ ...values, userId: activeProfileId })
    router.push('/therapies')
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="px-3 xs:px-6 pt-6">
        <h1 className="text-2xl font-semibold">Add Therapy</h1>
      </div>
      <TherapyForm onSubmit={onSubmit} />
    </div>
  )
}

export default CreateTherapyPage
