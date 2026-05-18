import { formatCurrency } from '@/lib/utils'

export type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{ name: string, value: number, payload: { type: string, total: number, count: number } }>
}

export const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const { name, payload: item } = payload[0]
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-popover-foreground">{name}</p>
      <p className="text-muted-foreground">{formatCurrency(item.total)}</p>
      <p className="text-muted-foreground text-xs">
        {item.count}
        {' '}
        expense
        {item.count !== 1 ? 's' : ''}
      </p>
    </div>
  )
}
