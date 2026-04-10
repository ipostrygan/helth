'use server'

import prisma from '@/lib/prisma'
import { Appointment, AppointmentStatus, AppointmentType, ExpenseType } from '@/lib/generated/prisma/client'
import type { PaginatedResult } from '@/types'
import type { AppointmentsQueryParams } from '@/app/(app)/appointments/types'

const APPOINTMENT_TYPE_TO_EXPENSE_TYPE: Record<AppointmentType, ExpenseType> = {
  [AppointmentType.GeneralPractitioner]: ExpenseType.DoctorVisit,
  [AppointmentType.Specialist]: ExpenseType.DoctorVisit,
  [AppointmentType.Dental]: ExpenseType.Dental,
  [AppointmentType.MentalHealth]: ExpenseType.MentalHealth,
  [AppointmentType.Lab]: ExpenseType.Procedure,
  [AppointmentType.Imaging]: ExpenseType.Procedure,
  [AppointmentType.Emergency]: ExpenseType.DoctorVisit,
  [AppointmentType.FollowUp]: ExpenseType.DoctorVisit,
  [AppointmentType.Vaccination]: ExpenseType.DoctorVisit,
  [AppointmentType.Other]: ExpenseType.DoctorVisit
}

type AppointmentFields = {
  title: string
  date: Date
  type: AppointmentType
  status: AppointmentStatus
  cost: number
  description?: string
  doctorName?: string
  location?: string
  notes?: string
  therapyId?: string | null
}

export type CreateAppointmentInput = AppointmentFields & { userId: string }
export type UpdateAppointmentInput = Partial<AppointmentFields> & { id: string }

export const getAppointments = async ({
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
}: AppointmentsQueryParams = {}): Promise<PaginatedResult<Appointment>> => {
  const skip = (page - 1) * pageSize
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(therapyId ? { therapyId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { doctorName: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
            { notes: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}),
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {})
          }
        }
      : {}),
    ...(statuses && statuses.length > 0 ? { status: { in: statuses as AppointmentStatus[] } } : {})
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection }
      }),
      prisma.appointment.count({ where })
    ])

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch appointments')
  }
}

export const deleteAppointment = async (id: string): Promise<void> => {
  try {
    await prisma.appointment.delete({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to delete appointment')
  }
}

export const createAppointment = async (input: CreateAppointmentInput) => {
  try {
    const appointment = await prisma.appointment.create({ data: { ...input, relatedDocuments: [] } })
    if (input.cost != null && !isNaN(input.cost)) {
      await prisma.medicalExpense.create({
        data: {
          userId: input.userId,
          title: input.title,
          amount: input.cost,
          date: input.date,
          type: APPOINTMENT_TYPE_TO_EXPENSE_TYPE[input.type],
          therapyId: input.therapyId ?? null,
          appointmentId: appointment.id
        }
      })
    }
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to create appointment')
  }
}

export const updateAppointment = async ({ id, ...data }: UpdateAppointmentInput) => {
  try {
    await prisma.appointment.update({ where: { id }, data })
    if (data.cost != null && !isNaN(data.cost)) {
      await prisma.medicalExpense.updateMany({
        where: { appointmentId: id },
        data: { amount: data.cost }
      })
    }
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to update appointment')
  }
}

export const getAppointmentById = async (id: string): Promise<Appointment | null> => {
  try {
    return await prisma.appointment.findUnique({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch appointment')
  }
}

export const addDocumentToAppointment = async (id: string, key: string): Promise<void> => {
  try {
    await prisma.appointment.update({
      where: { id },
      data: { relatedDocuments: { push: key } }
    })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to add document to appointment')
  }
}

export const removeDocumentFromAppointment = async (id: string, key: string): Promise<void> => {
  try {
    const appointment = await prisma.appointment.findUnique({ where: { id }, select: { relatedDocuments: true } })
    if (!appointment) return
    await prisma.appointment.update({
      where: { id },
      data: { relatedDocuments: appointment.relatedDocuments.filter(k => k !== key) }
    })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to remove document from appointment')
  }
}
