'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { AppLink } from '@/components/ui/app-link'
import { Pencil } from 'lucide-react'
import { Breadcrumbs } from '@/components/breadcrumbs'
import { Button } from '@/components/ui/button'
import { useAppointment } from '../hooks/use-appointment'
import { useTherapy } from '../../therapies/hooks/use-therapy'
import { Separator } from '@/components/ui/separator'
import { DetailRow } from '@/components/ui/detail-row'
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS
} from '../constants'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DocumentsCard } from '@/components/documents-card'
import { useDocuments } from '@/app/(app)/hooks/use-documents'
import { queryKeys } from '@/lib/query-keys'

const STATUS_STYLES = {
  Scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
}

const AppointmentDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const { data: appointment, isLoading } = useAppointment(id)
  const { data: therapy } = useTherapy(appointment?.therapyId ?? '')
  const { uploadMutation, removeMutation } = useDocuments(`/api/appointments/${id}/documents`, queryKeys.appointments.detail(id))

  if (isLoading || !appointment) return null

  return (
    <div className="sm:px-6 sm:pt-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-1">
        <Breadcrumbs items={[{ label: 'Appointments', href: '/appointments' }, { label: appointment.title }]} />
        <h1 className="text-2xl font-semibold">{appointment.title}</h1>
      </div>

      <Card>
        <CardHeader className="border-b gap-0">
          <CardTitle className="text-base">Details</CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/appointments/${id}/edit`}>
                <Pencil className="size-4 mr-1" />
                Edit
              </Link>
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Type">
            {APPOINTMENT_TYPE_LABELS[appointment.type]}
          </DetailRow>
          <Separator />
          <DetailRow label="Status">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[appointment.status]}`}
            >
              {APPOINTMENT_STATUS_LABELS[appointment.status]}
            </span>
          </DetailRow>
          <Separator />
          <DetailRow label="Date">
            {new Date(appointment.date).toLocaleDateString()}
          </DetailRow>
          <Separator />
          <DetailRow label="Cost">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(appointment.cost)}
          </DetailRow>
          <Separator />
          <DetailRow label="Therapy">
            {appointment.therapyId
              ? (
                  <AppLink href={`/therapies/${appointment.therapyId}`}>
                    {therapy?.title ?? appointment.therapyId}
                  </AppLink>
                )
              : (
                  '—'
                )}
          </DetailRow>
          <Separator />
          <DetailRow label="Specialist">
            {appointment.specialistName
              ? appointment.specialistLink
                ? (
                    <AppLink
                      external
                      href={appointment.specialistLink}
                      target={appointment.specialistLink.startsWith('http') ? '_blank' : undefined}
                      rel={appointment.specialistLink.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {appointment.specialistName}
                    </AppLink>
                  )
                : appointment.specialistName
              : '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Location">
            {appointment.location || '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Notes">
            {appointment.notes || '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {appointment.description || '—'}
          </DetailRow>
        </CardContent>
      </Card>
      <DocumentsCard documents={appointment.documents ?? []} uploadMutation={uploadMutation} removeMutation={removeMutation} />
    </div>
  )
}

export default function Page() {
  return <Suspense><AppointmentDetailPage /></Suspense>
}
