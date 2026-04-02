'use client'

import Link from 'next/link'
import type { MedicalExpense } from '@/lib/generated/prisma/client'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { EXPENSE_TYPE_LABELS } from '../constants'
import { useTherapy } from '../../therapies/hooks/use-therapy'
import { useAppointment } from '../../appointments/hooks/use-appointment'

type Props = {
  expense: MedicalExpense | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MedicalExpenseDetailsSheet({ expense, open, onOpenChange }: Props) {
  const { data: therapy } = useTherapy(expense?.therapyId ?? '')
  const { data: appointment } = useAppointment(expense?.appointmentId ?? '')

  if (!expense) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="pb-2">
          <SheetTitle>{expense.title}</SheetTitle>
        </SheetHeader>

        <div className="px-4 space-y-4">
          <DetailRow label="Amount">
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(expense.amount)}
          </DetailRow>
          <Separator />
          <DetailRow label="Date">
            {new Date(expense.date).toLocaleDateString()}
          </DetailRow>
          <Separator />
          <DetailRow label="Type">
            {EXPENSE_TYPE_LABELS[expense.type]}
          </DetailRow>
          <Separator />
          <DetailRow label="Therapy">
            {expense.therapyId
              ? (
                  <Link href={`/therapies/${expense.therapyId}`} className="underline hover:no-underline">
                    {therapy?.title ?? expense.therapyId}
                  </Link>
                )
              : '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Appointment">
            {expense.appointmentId
              ? (
                  <Link href={`/appointments/${expense.appointmentId}`} className="underline hover:no-underline">
                    {appointment?.title ?? expense.appointmentId}
                  </Link>
                )
              : '—'}
          </DetailRow>
          <Separator />
          <DetailRow label="Description">
            {expense.description ?? '—'}
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
