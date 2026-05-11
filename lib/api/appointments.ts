import type { PaginatedResult, DocumentItem } from '@/types'
import type { AppointmentsQueryParams } from '@/app/(app)/appointments/types'
import type { Appointment } from '@/lib/generated/prisma/client'
import type { AppointmentWithUser } from '@/app/actions/appointments'
import {
  buildSearchParams,
  fetchOne,
  deleteResource,
  uploadDocuments,
  deleteDocument
} from './utils'

const BASE = '/api/appointments'

export type AppointmentWithDocuments = Appointment & {
  documents: DocumentItem[]
}

export async function getAppointments(
  params: AppointmentsQueryParams
): Promise<PaginatedResult<AppointmentWithUser>> {
  const searchParams = buildSearchParams(params, {
    statuses: params.statuses,
    therapyId: params.therapyId
  })
  const res = await fetch(`${BASE}?${searchParams}`)
  if (!res.ok) throw new Error(`Failed to fetch appointments: ${res.status}`)
  return res.json()
}

export const getAppointment = (id: string) =>
  fetchOne<AppointmentWithDocuments>(`${BASE}/${id}`)

export const deleteAppointment = (id: string) =>
  deleteResource(`${BASE}/${id}`)

export const uploadAppointmentDocuments = (id: string, files: File[]) =>
  uploadDocuments(`${BASE}/${id}`, files)

export const deleteAppointmentDocument = (id: string, key: string) =>
  deleteDocument(`${BASE}/${id}`, key)
