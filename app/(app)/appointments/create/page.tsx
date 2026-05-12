'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useActiveProfile } from '@/context/profile-context'
import { FamilyMemberSelect } from '@/components/custom/family-member-select'
import AppointmentForm, { type AppointmentFormValues } from '../components/appointment-form'
import { useCreateAppointment } from '../hooks/use-create-appointment'

const CreateAppointmentPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { activeProfileId, isFamilyProfile } = useActiveProfile()
  const { mutateAsync: createAppointment } = useCreateAppointment()
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)

  const therapyId = searchParams.get('therapyId')
  const backHref = therapyId ? `/therapies/${therapyId}` : '/appointments'

  if (!isFamilyProfile && !activeProfileId) return null

  const userId = isFamilyProfile ? selectedUserId : activeProfileId

  const onSubmit = async (values: AppointmentFormValues) => {
    await createAppointment({ ...values, userId: userId! })
    router.push(backHref)
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="px-3 xs:px-6 pt-6 space-y-4">
        <h1 className="text-2xl font-semibold">Add Appointment</h1>
        {isFamilyProfile && (
          <FamilyMemberSelect value={selectedUserId} onChange={setSelectedUserId} />
        )}
      </div>
      <AppointmentForm
        defaultTherapyId={therapyId}
        cancelHref={backHref}
        onSubmit={onSubmit}
        isSubmitDisabled={isFamilyProfile && !selectedUserId}
      />
    </div>
  )
}

export default function Page() {
  return <Suspense><CreateAppointmentPage /></Suspense>
}
