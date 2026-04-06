'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { useActiveProfile } from '@/context/profile-context'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useAppointment } from '../../hooks/use-appointment'
import AppointmentForm, { type AppointmentFormValues } from '../../components/appointment-form'
import { useEditAppointment } from '../../hooks/use-edit-appointment'

type EditPageProps = {
  params: Promise<{ id: string }>
}

const EditAppointmentPage = ({ params }: EditPageProps) => {
  const { id } = use(params)
  const router = useRouter()
  const { activeProfileId } = useActiveProfile()
  const { data: appointment, isLoading } = useAppointment(id)
  const { mutateAsync: editAppointment } = useEditAppointment()

  if (isLoading) return null
  if (!appointment || !activeProfileId) return null

  const onSubmit = async (values: AppointmentFormValues) => {
    await editAppointment({ id: appointment.id, ...values })
    router.push(`/appointments/${appointment.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col">
      <div className="px-3 xs:px-6 pt-6 space-y-1">
        <Breadcrumbs items={[{ label: 'Appointments', href: '/appointments' }, { label: appointment.title, href: `/appointments/${id}` }, { label: 'Edit' }]} />
        <h1 className="text-2xl font-semibold">Edit Appointment</h1>
      </div>
      <AppointmentForm profileId={activeProfileId} appointment={appointment} onSubmit={onSubmit} />
    </div>
  )
}

export default EditAppointmentPage
