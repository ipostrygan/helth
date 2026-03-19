"use client"

import { use } from "react"
import { useTherapy } from "../hooks/use-therapy"
import { Separator } from "@/components/ui/separator"

type TherapyDetailPageProps = {
  params: Promise<{ id: string }>
}

const TherapyDetailPage = ({ params }: TherapyDetailPageProps) => {
  const { id } = use(params)
  const { data: therapy, isLoading } = useTherapy(id)

  if (isLoading) return null
  if (!therapy) return null

  return (
    <div className="px-6 pt-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{therapy.title}</h1>
      </div>

      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold">Details</h2>
        </div>
        <div className="px-6 py-4 space-y-4">
          <DetailRow label="Status">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                therapy.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
              }`}
            >
              {therapy.isActive ? "Ongoing" : "Finished"}
            </span>
          </DetailRow>
          <Separator />
          <DetailRow label="Start Date">
            {new Date(therapy.startDate).toLocaleDateString()}
          </DetailRow>
          <Separator />
          <DetailRow label="End Date">
            {therapy.endDate ? new Date(therapy.endDate).toLocaleDateString() : "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Therapist">
            {therapy.therapistName ? (
              therapy.therapistInfoLink ? (
                <a
                  href={therapy.therapistInfoLink}
                  target={therapy.therapistInfoLink.startsWith("http") ? "_blank" : undefined}
                  rel={therapy.therapistInfoLink.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="underline hover:no-underline"
                >
                  {therapy.therapistName}
                </a>
              ) : (
                therapy.therapistName
              )
            ) : (
              "—"
            )}
          </DetailRow>
          <Separator />
          <DetailRow label="Location">
            {therapy.location ?? "—"}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {therapy.description ?? "—"}
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

export default TherapyDetailPage
