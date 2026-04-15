import type { PaginatedResult, BaseQueryParams } from '@/types'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { buildSearchParams, fetchOne, deleteResource } from './utils'

const BASE = '/api/self-care-activities'

export type SelfCareActivitiesParams = BaseQueryParams

export async function getSelfCareActivities(
  params: SelfCareActivitiesParams
): Promise<PaginatedResult<SelfCareActivity>> {
  const sp = buildSearchParams(params)
  const res = await fetch(`${BASE}?${sp}`)
  return res.json()
}

export const getSelfCareActivity = (id: string) =>
  fetchOne<SelfCareActivity>(`${BASE}/${id}`)

export const deleteSelfCareActivity = (id: string) =>
  deleteResource(`${BASE}/${id}`)
