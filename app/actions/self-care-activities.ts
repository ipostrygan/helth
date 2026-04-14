'use server'

import prisma from '@/lib/prisma'
import { SelfCareActivity } from '@/lib/generated/prisma/client'
import type { PaginatedResult, BaseQueryParams } from '@/types'

export type SelfCareActivitiesQuery = BaseQueryParams

export const getSelfCareActivities = async ({
  profileId,
  page = 1,
  pageSize = 10,
  sortField = 'date',
  sortDirection = 'desc',
  search = '',
  dateFrom,
  dateTo
}: SelfCareActivitiesQuery = {}): Promise<PaginatedResult<SelfCareActivity>> => {
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
    ...(dateFrom || dateTo
      ? {
          date: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {})
          }
        }
      : {})
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.selfCareActivity.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection }
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

export const deleteSelfCareActivity = async (id: string): Promise<void> => {
  try {
    await prisma.selfCareActivity.delete({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to delete self-care session')
  }
}
