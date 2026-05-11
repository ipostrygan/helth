import type { PaginatedResult } from '@/types'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import type { Therapy } from '@/lib/generated/prisma/client'
import type { TherapyWithUser } from '@/app/actions/therapies'
import type { DocumentItem } from '@/lib/api/appointments'
import {
  buildSearchParams,
  fetchOne,
  deleteResource,
  uploadDocuments,
  deleteDocument
} from './utils'

const BASE = '/api/therapies'

export type Specialist = { name: string, link: string | null }
export type TherapyWithDocuments = Therapy & {
  documents: DocumentItem[]
  specialists: Specialist[]
}

export async function getTherapies(
  params: TherapiesQueryParams
): Promise<PaginatedResult<TherapyWithUser>> {
  const sp = buildSearchParams(params, {
    sortField: params.sortField ?? 'startDate',
    isActive: params.isActive?.length ? params.isActive : undefined
  })

  const res = await fetch(`${BASE}?${sp}`)
  if (!res.ok) throw new Error(`Failed to fetch therapies: ${res.status}`)
  return res.json()
}

export const getTherapy = (id: string) =>
  fetchOne<TherapyWithDocuments>(`${BASE}/${id}`)

export const deleteTherapy = (id: string) => deleteResource(`${BASE}/${id}`)

export const uploadTherapyDocuments = (id: string, files: File[]) =>
  uploadDocuments(`${BASE}/${id}`, files)

export const deleteTherapyDocument = (id: string, key: string) =>
  deleteDocument(`${BASE}/${id}`, key)
