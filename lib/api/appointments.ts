import type { PaginatedResult } from '@/types'
import type { AppointmentsQueryParams } from '@/app/(app)/appointments/types'
import type { Appointment } from '@/lib/generated/prisma/client'

export type DocumentItem = { key: string, name: string, url: string, downloadUrl: string }
export type AppointmentWithDocuments = Appointment & { documents: DocumentItem[] }

export async function getAppointments(
  params: AppointmentsQueryParams
): Promise<PaginatedResult<Appointment>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = 'date',
    sortDirection = 'desc',
    search = '',
    dateFrom,
    dateTo,
    statuses,
    therapyId
  } = params

  const searchParams = new URLSearchParams({
    ...(profileId ? { profileId } : {}),
    page: String(page),
    pageSize: String(pageSize),
    sortField,
    sortDirection,
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    ...(statuses && statuses.length > 0 ? { statuses: statuses.join(',') } : {}),
    ...(therapyId ? { therapyId } : {})
  })

  const res = await fetch(`/api/appointments?${searchParams}`)
  return res.json()
}

export async function deleteAppointment(id: string): Promise<void> {
  const res = await fetch(`/api/appointments/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete appointment')
}

export async function getAppointment(id: string): Promise<AppointmentWithDocuments> {
  const res = await fetch(`/api/appointments/${id}`)
  if (!res.ok) throw new Error('Failed to fetch appointment')
  return res.json()
}

export async function uploadAppointmentDocuments(id: string, files: File[]): Promise<{ keys: string[] }> {
  const formData = new FormData()
  files.forEach(file => formData.append('files', file))
  const res = await fetch(`/api/appointments/${id}/documents`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error ?? 'Failed to upload documents')
  }
  return res.json()
}

export async function deleteAppointmentDocument(id: string, key: string): Promise<void> {
  const res = await fetch(`/api/appointments/${id}/documents`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key })
  })
  if (!res.ok) throw new Error('Failed to delete document')
}
