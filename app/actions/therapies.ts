'use server'

import prisma from '@/lib/prisma'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import type { Therapy } from '@/lib/generated/prisma/client'
import type { ProfileSummary } from '@/types'
import { buildDateRangeFilter, buildSearchFilter } from '@/lib/db'
import { handleActionError } from '@/lib/actions/handle-action-error'
import { DEFAULT_PAGE_SIZE } from '@/lib/constants'

export type TherapyWithUser = Therapy & { user: ProfileSummary }

type TherapyFields = {
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  isActive: boolean
}

export type CreateTherapyInput = { userId: string } & TherapyFields

export type UpdateTherapyInput = { id: string } & Partial<TherapyFields>

export const getTherapies = async ({
  profileId,
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE,
  sortField = 'startDate',
  sortDirection = 'desc',
  search = '',
  dateFrom,
  dateTo,
  isActive
}: TherapiesQueryParams = {}) => {
  const skip = (page - 1) * pageSize
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...buildSearchFilter(search, ['title', 'description']),
    ...buildDateRangeFilter(dateFrom, dateTo, 'startDate'),
    ...(isActive && isActive.length === 1
      ? { isActive: isActive[0] === 'true' }
      : {})
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.therapy.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection },
        include: {
          user: {
            select: { firstName: true, shortName: true, profileType: true }
          }
        }
      }),
      prisma.therapy.count({ where })
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
    handleActionError(e)
  }
}

export const deleteTherapy = async (id: string) => {
  try {
    await prisma.therapy.delete({ where: { id } })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const createTherapy = async (input: CreateTherapyInput) => {
  try {
    await prisma.therapy.create({ data: input })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const updateTherapy = async ({ id, ...data }: UpdateTherapyInput) => {
  try {
    await prisma.therapy.update({ where: { id }, data })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const getTherapyById = async (id: string) => {
  try {
    return await prisma.therapy.findUnique({
      where: { id },
      include: {
        appointments: {
          where: { specialistName: { not: null } },
          select: { specialistName: true, specialistLink: true }
        }
      }
    })
  }
  catch (e) {
    handleActionError(e)
  }
}
