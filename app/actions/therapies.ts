'use server'

import prisma from '@/lib/prisma'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'
import type { Therapy } from '@/lib/generated/prisma/client'
import type { ProfileSummary } from '@/types'
import { buildDateRangeFilter } from '@/lib/db'

export type TherapyWithUser = Therapy & { user: ProfileSummary }

export const getTherapies = async ({
  profileId,
  page = 1,
  pageSize = 10,
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
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}),
    ...buildDateRangeFilter(dateFrom, dateTo, 'startDate'),
    ...(isActive && isActive.length === 1 ? { isActive: isActive[0] === 'true' } : {})
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.therapy.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection },
        include: { user: { select: { firstName: true, shortName: true, profileType: true } } }
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
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch therapies')
  }
}

export const deleteTherapy = async (id: string) => {
  try {
    await prisma.therapy.delete({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to delete therapy')
  }
}

export type CreateTherapyInput = {
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  isActive: boolean
}

export const createTherapy = async (input: CreateTherapyInput) => {
  try {
    await prisma.therapy.create({ data: input })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to create therapy')
  }
}

export type UpdateTherapyInput = {
  id: string
  title?: string
  description?: string
  startDate?: Date
  endDate?: Date
  isActive?: boolean
}

export const updateTherapy = async ({ id, ...data }: UpdateTherapyInput) => {
  try {
    await prisma.therapy.update({ where: { id }, data })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to update therapy')
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
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch therapy')
  }
}
