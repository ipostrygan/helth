import type { PaginatedResult } from '@/types'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import type { Therapy } from '@/lib/generated/prisma/client'
import type { DocumentItem } from '@/lib/api/appointments'
import { buildSearchParams, fetchOne, deleteResource, uploadDocuments, deleteDocument } from './utils'

const BASE = '/api/therapies'

export type TherapyWithDocuments = Therapy & { documents: DocumentItem[] }

export async function getTherapies(
  params: TherapiesQueryParams
): Promise<PaginatedResult<Therapy>> {
  const sp = buildSearchParams(params, { sortField: params.sortField ?? 'startDate' })

  if (params.isActive && params.isActive.length > 0) {
    params.isActive.forEach(v => sp.append('isActive', v))
  }

  const res = await fetch(`${BASE}?${sp}`)
  if (!res.ok) throw new Error(`Failed to fetch therapies: ${res.status}`)
  return res.json()
}

export const getTherapy = (id: string) =>
  fetchOne<TherapyWithDocuments>(`${BASE}/${id}`)

export const deleteTherapy = (id: string) =>
  deleteResource(`${BASE}/${id}`)

export const uploadTherapyDocuments = (id: string, files: File[]) =>
  uploadDocuments(`${BASE}/${id}`, files)

export const deleteTherapyDocument = (id: string, key: string) =>
  deleteDocument(`${BASE}/${id}`, key)
