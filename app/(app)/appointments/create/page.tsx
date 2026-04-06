'use client'

import { useRouter } from 'next/navigation'
import { useActiveProfile } from '@/context/profile-context'
import AppointmentForm, { type AppointmentFormValues } from '../components/appointment-form'
import { useCreateAppointment } from '../hooks/use-create-appointment'

const CreateAppointmentPage = () => {
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { mutateAsync: createAppointment } = useCreateAppointment()

  if (!activeProfileId) return null

  const onSubmit = async (values: AppointmentFormValues) => {
    await createAppointment({ ...values, userId: activeProfileId })
    router.push('/appointments')
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="px-3 xs:px-6 pt-6">
        <h1 className="text-2xl font-semibold">Add Appointment</h1>
      </div>
      <AppointmentForm profileId={activeProfileId} onSubmit={onSubmit} />
    </div>
  )
}

export default CreateAppointmentPage
