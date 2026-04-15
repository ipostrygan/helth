'use client'

import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

type Props = {
  selfCareActivity: SelfCareActivity | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SelfCareActivityDetailsSheet({ selfCareActivity, open, onOpenChange }: Props) {
  if (!selfCareActivity) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{selfCareActivity.title}</SheetTitle>
        </SheetHeader>

        <div className="px-4 space-y-4">
          <DetailRow label="Date">
            {new Date(selfCareActivity.date).toLocaleDateString()}
          </DetailRow>
          <Separator />
          <DetailRow label="Medication">
            {selfCareActivity.medication}
          </DetailRow>
          <Separator />
          <DetailRow label="Dosage">
            {selfCareActivity.dosage}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {selfCareActivity.description ?? '—'}
          </DetailRow>
        </div>
      </SheetContent>
    </Sheet>
  )
}

const DetailRow = ({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}) => (
  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-0">
    <span className="text-sm text-muted-foreground sm:w-36 shrink-0">{label}</span>
    <span className="text-sm">{children}</span>
  </div>
)
