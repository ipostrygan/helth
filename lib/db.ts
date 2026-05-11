export function buildDateRangeFilter(
  dateFrom?: string | null,
  dateTo?: string | null,
  field = 'date'
) {
  if (!dateFrom && !dateTo) return {}
  return {
    [field]: {
      ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
      ...(dateTo ? { lte: new Date(dateTo) } : {})
    }
  }
}

export function buildSearchFilter(search: string, fields: string[]) {
  if (!search) return {}
  return {
    OR: fields.map(field => ({
      [field]: { contains: search, mode: 'insensitive' as const }
    }))
  }
}
