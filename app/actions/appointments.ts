'use server'

import prisma from '@/lib/prisma'
import { Appointment, AppointmentStatus, AppointmentType, ExpenseType } from '@/lib/generated/prisma/client'
import type { AppointmentsQueryParams } from '@/app/(app)/appointments/types'
import type { ProfileSummary } from '@/types'
import { buildDateRangeFilter, buildSearchFilter } from '@/lib/db'
import { handleActionError } from '@/lib/actions/handle-action-error'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export type AppointmentWithUser = Appointment & { user: ProfileSummary }

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
  specialistName?: string
  specialistLink?: string
  location?: string
  notes?: string
  therapyId?: string | null
}

export type CreateAppointmentInput = AppointmentFields & { userId: string }
export type UpdateAppointmentInput = Partial<AppointmentFields> & { id: string }

export const getAppointments = async ({
  profileId,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  sortField = 'date',
  sortDirection = 'desc',
  search = '',
  dateFrom,
  dateTo,
  statuses,
  therapyId
}: AppointmentsQueryParams = {}) => {
  const skip = (page - 1) * pageSize
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(therapyId ? { therapyId } : {}),
    ...buildSearchFilter(search, ['title', 'specialistName', 'location']),
    ...buildDateRangeFilter(dateFrom, dateTo),
    ...(statuses && statuses.length > 0 ? { status: { in: statuses } } : {})
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection },
        include: { user: { select: { firstName: true, shortName: true, profileType: true } } }
      }),
      prisma.appointment.count({ where })
    ])

    return { data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) }
  }
  catch (e) {
    handleActionError(e)
  }
}

export const deleteAppointment = async (id: string) => {
  try {
    await prisma.appointment.delete({ where: { id } })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const createAppointment = async (input: CreateAppointmentInput) => {
  try {
    await prisma.$transaction(async (tx) => {
      const appointment = await tx.appointment.create({ data: { ...input, relatedDocuments: [] } })
      if (input.cost && !isNaN(input.cost)) {
        await tx.medicalExpense.create({
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
    })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const updateAppointment = async ({ id, ...data }: UpdateAppointmentInput) => {
  try {
    const expenseUpdate = {
      ...(data.cost && !isNaN(data.cost) ? { amount: data.cost } : {}),
      ...('therapyId' in data ? { therapyId: data.therapyId ?? null } : {})
    }
    await prisma.$transaction([
      prisma.appointment.update({ where: { id }, data }),
      ...(Object.keys(expenseUpdate).length > 0
        ? [prisma.medicalExpense.updateMany({ where: { appointmentId: id }, data: expenseUpdate })]
        : [])
    ])
  }
  catch (e) {
    handleActionError(e)
  }
}

export const getAppointmentById = async (id: string) => {
  try {
    return await prisma.appointment.findUnique({ where: { id } })
  }
  catch (e) {
    handleActionError(e)
  }
}
