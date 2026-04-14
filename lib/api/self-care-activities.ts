import type { PaginatedResult, BaseQueryParams } from '@/types'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'

export type SelfCareActivitiesParams = BaseQueryParams

export async function getSelfCareActivities(
  params: SelfCareActivitiesParams
): Promise<PaginatedResult<SelfCareActivity>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = 'date',
    sortDirection = 'desc',
    search = '',
    dateFrom,
    dateTo
  } = params

  const searchParams = new URLSearchParams({
    ...(profileId ? { profileId } : {}),
    page: String(page),
    pageSize: String(pageSize),
    sortField,
    sortDirection,
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {})
  })

  const res = await fetch(`/api/self-care-activities?${searchParams}`)
  return res.json()
}

export async function deleteSelfCareActivity(id: string): Promise<void> {
  const res = await fetch(`/api/self-care-activities/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete self-care activity')
}
