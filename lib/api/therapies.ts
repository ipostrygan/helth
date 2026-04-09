import type { PaginatedResult } from '@/types'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import type { Therapy } from '@/lib/generated/prisma/client'
import type { DocumentItem } from '@/lib/api/appointments'

export type TherapyWithDocuments = Therapy & { documents: DocumentItem[] }

export async function getTherapies(
  params: TherapiesQueryParams
): Promise<PaginatedResult<Therapy>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = 'startDate',
    sortDirection = 'desc',
    search = '',
    dateFrom,
    dateTo,
    isActive
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

  if (isActive && isActive.length > 0) {
    isActive.forEach(v => searchParams.append('isActive', v))
  }

  const res = await fetch(`/api/therapies?${searchParams}`)
  return res.json()
}

export async function deleteTherapy(id: string): Promise<void> {
  const res = await fetch(`/api/therapies/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete therapy')
}

export async function getTherapy(id: string): Promise<TherapyWithDocuments> {
  const res = await fetch(`/api/therapies/${id}`)
  if (!res.ok) throw new Error('Failed to fetch therapy')
  return res.json()
}

export async function uploadTherapyDocuments(id: string, files: File[]): Promise<{ keys: string[] }> {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  const res = await fetch(`/api/therapies/${id}/documents`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to upload documents')
  }
  return res.json()
}

export async function deleteTherapyDocument(id: string, key: string): Promise<void> {
  const res = await fetch(`/api/therapies/${id}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  })
  if (!res.ok) throw new Error('Failed to delete document')
}
