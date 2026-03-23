"use client"

import { use } from "react"
import Link from "next/link"
import { BackLink } from "@/components/back-link"
import { useAppointment } from "../hooks/use-appointment"
import { useTherapy } from "../../therapies/hooks/use-therapy"
import { Separator } from "@/components/ui/separator"
import {
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "../constants"
import type { AppointmentStatus } from "@/lib/generated/prisma/client"

type AppointmentDetailPageProps = {
  params: Promise<{ id: string }>
}

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  Scheduled:  "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  Completed:  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  Cancelled:  "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400",
  NoShow:     "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400",
}

const AppointmentDetailPage = ({ params }: AppointmentDetailPageProps) => {
  const { id } = use(params)
  const { data: appointment, isLoading } = useAppointment(id)
  const { data: therapy } = useTherapy(appointment?.therapyId ?? "")

  if (isLoading) return null
  if (!appointment) return null

  return (
    <div className="px-6 pt-6 space-y-6">
      <div className="space-y-1">
        <BackLink href="/appointments" />
        <h1 className="text-2xl font-semibold">{appointment.title}</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Details</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
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
          <DetailRow label="End Date">
            {appointment.endDate ? new Date(appointment.endDate).toLocaleDateString() : "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Therapy">
            {appointment.therapyId ? (
              <Link href={`/therapies/${appointment.therapyId}`} className="underline hover:no-underline">
                {therapy?.title ?? appointment.therapyId}
              </Link>
            ) : (
              "—"
            )}
          </DetailRow>
          <Separator />
          <DetailRow label="Doctor">
            {appointment.doctorName ?? "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Location">
            {appointment.location ?? "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Notes">
            {appointment.notes ?? "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {appointment.description ?? "—"}
          </DetailRow>
        </div>
      </div>
    </div>
  )
}

const DetailRow = ({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-0">
    <span className="text-sm text-muted-foreground sm:w-48 shrink-0">{label}</span>
    <span className="text-sm">{children}</span>
  </div>
)

export default AppointmentDetailPage
