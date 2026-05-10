export function buildDateRangeFilter(dateFrom?: string | null, dateTo?: string | null, field = 'date') {
  if (!dateFrom && !dateTo) return {}
  return {
    [field]: {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {})
    }
  }
}
