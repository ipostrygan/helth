"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts"
import { format } from "date-fns"
import { type DateRange } from "react-day-picker"
import { useActiveProfile } from "@/context/profile-context"
import { useMedicalExpensesByType } from "../hooks/use-medical-expenses-by-type"
import { EXPENSE_TYPE_LABELS } from "../constants"
import { DateRangePicker } from "@/components/ui/date-range-picker"

const COLORS = [
  "#93c5d8",
  "#86c9a5",
  "#b5aee0",
  "#f0c08a",
  "#f49bad",
]

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "EUR" }).format(value)

type CustomTooltipProps = {
  active?: boolean
  payload?: Array<{ name: string; value: number; payload: { type: string; total: number; count: number } }>
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  const { name, payload: item } = payload[0]
  return (
    <div className="rounded-lg border bg-white px-3 py-2 shadow-md text-sm">
      <p className="font-medium text-gray-800">{name}</p>
      <p className="text-gray-600">{formatCurrency(item.total)}</p>
      <p className="text-gray-400 text-xs">{item.count} expense{item.count !== 1 ? "s" : ""}</p>
    </div>
  )
}

const MedicalExpensesStatistics = () => {
  const { activeProfileId } = useActiveProfile()

  const defaultDateFrom = new Date()
  defaultDateFrom.setMonth(defaultDateFrom.getMonth() - 1)

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: defaultDateFrom,
    to: new Date(),
  })

  const { data, isLoading } = useMedicalExpensesByType({
    profileId: activeProfileId ?? undefined,
    dateFrom: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
    dateTo: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  })

  const chartData = (data ?? []).map((item) => ({
    ...item,
    name: EXPENSE_TYPE_LABELS[item.type],
  }))

  const total = chartData.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Expenses by type</h2>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-gray-400 text-sm">Loading...</div>
      ) : chartData.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-gray-400 text-sm">
          No expenses found for the selected period.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <div className="w-full sm:w-120 h-96">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="total"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={160}
                  strokeWidth={0}
                >
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col gap-2 min-w-48">
            {chartData.map((item, index) => (
              <div key={item.type} className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-700 flex-1">{item.name}</span>
                <span className="text-sm font-medium text-gray-800">{formatCurrency(item.total)}</span>
              </div>
            ))}
            <div className="mt-2 border-t pt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-sm font-semibold text-gray-800">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicalExpensesStatistics
