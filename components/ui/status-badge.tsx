type StatusVariant = 'Scheduled' | 'Completed' | 'Ongoing' | 'Finished'

const STATUS_STYLES: Record<StatusVariant, string> = {
  Scheduled: 'bg-indigo-50 text-indigo-600',
  Completed: 'bg-emerald-50 text-green-800',
  Ongoing: 'bg-amber-50 text-amber-700',
  Finished: 'bg-neutral-100 text-neutral-600'
}

interface StatusBadgeProps {
  status: StatusVariant
  label?: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]}`}>
      {label ?? status}
    </span>
  )
}
