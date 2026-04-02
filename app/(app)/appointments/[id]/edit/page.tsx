'use client'

import { use } from 'react'
import { useActiveProfile } from '@/context/profile-context'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useAppointment } from '../../hooks/use-appointment'
import AppointmentForm from '../../components/appointment-form'

type EditPageProps = {
  params: Promise<{ id: string }>
}

const EditAppointmentPage = ({ params }: EditPageProps) => {
  const { id } = use(params)
  const { activeProfileId } = useActiveProfile()
  const { data: appointment, isLoading } = useAppointment(id)

  if (isLoading) return null
  if (!appointment || !activeProfileId) return null

  return (
    <div>
      <div className="px-6 pt-6 space-y-1">
        <Breadcrumbs items={[{ label: 'Appointments', href: '/appointments' }, { label: appointment.title, href: `/appointments/${id}` }, { label: 'Edit' }]} />
        <h1 className="text-2xl font-semibold">Edit Appointment</h1>
      </div>
      <AppointmentForm profileId={activeProfileId} appointment={appointment} />
    </div>
  )
}

export default EditAppointmentPage
