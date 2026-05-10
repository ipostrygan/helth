import type { PaginatedResult, BaseQueryParams } from '@/types'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import type { SelfCareActivityWithUser } from '@/app/actions/self-care-activities'
import { buildSearchParams, fetchOne, deleteResource } from './utils'

const BASE = '/api/self-care-activities'

export async function getSelfCareActivities(
  params: BaseQueryParams
): Promise<PaginatedResult<SelfCareActivityWithUser>> {
  const searchParams = buildSearchParams(params)
  const res = await fetch(`${BASE}?${searchParams}`)
  if (!res.ok) {
    throw new Error(`Failed to fetch self-care activities: ${res.status}`)
  }
  return res.json()
}

export const getSelfCareActivity = (id: string) =>
  fetchOne<SelfCareActivity>(`${BASE}/${id}`)

export const deleteSelfCareActivity = (id: string) =>
  deleteResource(`${BASE}/${id}`)
