'use server'

import prisma from '@/lib/prisma'
import type { BaseQueryParams, ProfileSummary } from '@/types'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { buildDateRangeFilter } from '@/lib/db'

export type SelfCareActivityWithUser = SelfCareActivity & { user: ProfileSummary }

type SelfCareActivityFields = {
  title: string
  date: Date
  description?: string
  medication: string
  dosage: string
}

export type CreateSelfCareActivityInput = SelfCareActivityFields & { userId: string }
export type UpdateSelfCareActivityInput = Partial<SelfCareActivityFields> & { id: string }

export const getSelfCareActivities = async ({
  profileId,
  page = 1,
  pageSize = 10,
  sortField = 'date',
  sortDirection = 'desc',
  search = '',
  dateFrom,
  dateTo
}: BaseQueryParams = {}) => {
  const skip = (page - 1) * pageSize
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { medication: { contains: search, mode: 'insensitive' as const } },
            { dosage: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}),
    ...buildDateRangeFilter(dateFrom, dateTo)
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.selfCareActivity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection },
        include: { user: { select: { firstName: true, shortName: true, profileType: true } } }
      }),
      prisma.selfCareActivity.count({ where })
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
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch self-care activities')
  }
}

export const deleteSelfCareActivity = async (id: string) => {
  try {
    await prisma.selfCareActivity.delete({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to delete self-care session')
  }
}

export const getSelfCareActivityById = async (id: string) => {
  return prisma.selfCareActivity.findUnique({ where: { id } })
}

export const createSelfCareActivity = async (input: CreateSelfCareActivityInput) => {
  try {
    await prisma.selfCareActivity.create({ data: input })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to create self-care activity')
  }
}

export const updateSelfCareActivity = async ({ id, ...data }: UpdateSelfCareActivityInput) => {
  try {
    await prisma.selfCareActivity.update({ where: { id }, data })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to update self-care activity')
  }
}
