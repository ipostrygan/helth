'use client'

import { useActiveProfile } from '@/context/profile-context'
import AppointmentForm from '../components/appointment-form'

const CreateAppointmentPage = () => {
  const { activeProfileId } = useActiveProfile()

  if (!activeProfileId) return null

  return (
    <div>
      <div className="px-6 pt-6">
        <h1 className="text-2xl font-semibold">Add Appointment</h1>
      </div>
      <AppointmentForm profileId={activeProfileId} />
    </div>
  )
}

export default CreateAppointmentPage
