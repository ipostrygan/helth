'use client'

import { Suspense } from 'react'
import { useParams } from 'next/navigation'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { useAppointment } from '../hooks/use-appointment'
import { useTherapy } from '../../therapies/hooks/use-therapy'
import { DocumentsCard } from '@/components/documents-card'
import { AppointmentDetailsCard } from './appointment-details-card'
import { useDocuments } from '@/hooks/use-documents'
import { queryKeys } from '@/lib/query-keys'
import { DetailPageSkeleton } from '@/components/custom/detail-page-skeleton'

const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: appointment, isLoading } = useAppointment(id)
  const { data: therapy } = useTherapy(appointment?.therapyId ?? '')
  const { uploadMutation, removeMutation } = useDocuments(`/api/appointments/${id}/documents`, queryKeys.appointments.detail(id))

  if (isLoading || !appointment) {
    return <DetailPageSkeleton detailRows={9} />
  }

  return (
    <div className="sm:px-6 sm:pt-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: 'Appointments', href: '/appointments' }, { label: appointment.title }]} />
        <h1 className="text-2xl font-semibold">{appointment.title}</h1>
      </div>

      <AppointmentDetailsCard appointment={appointment} therapy={therapy} id={id} />
      <DocumentsCard documents={appointment.documents ?? []} uploadMutation={uploadMutation} removeMutation={removeMutation} />
    </div>
  )
}

export default function Page() {
  return <Suspense><AppointmentDetailPage /></Suspense>
}
