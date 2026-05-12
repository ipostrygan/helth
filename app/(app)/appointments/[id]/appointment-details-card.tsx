import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DetailRow } from '@/components/custom/detail-row'
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/custom/status-badge'
import { AppLink } from '@/components/custom/app-link'
import { formatCurrency } from '@/lib/utils'
import { APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS } from '../constants'
import type { AppointmentWithDocuments } from '@/lib/api/appointments'
import type { TherapyWithDocuments } from '@/lib/api/therapies'

interface AppointmentDetailsCardProps {
  appointment: AppointmentWithDocuments
  therapy: TherapyWithDocuments | undefined
  id: string
}

export const AppointmentDetailsCard = ({ appointment, therapy, id }: AppointmentDetailsCardProps) => (
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
        <StatusBadge status={appointment.status} label={APPOINTMENT_STATUS_LABELS[appointment.status]} />
      </DetailRow>
      <Separator />
      <DetailRow label="Date">
        {new Date(appointment.date).toLocaleDateString()}
      </DetailRow>
      <Separator />
      <DetailRow label="Cost">
        {formatCurrency(appointment.cost)}
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
                  target="_blank"
                  rel="noopener noreferrer"
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
)
