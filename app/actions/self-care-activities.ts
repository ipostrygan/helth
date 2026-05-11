'use server'

import prisma from '@/lib/prisma'
import type { BaseQueryParams, ProfileSummary } from '@/types'
import type { SelfCareActivity } from '@/lib/generated/prisma/client'
import { buildDateRangeFilter, buildSearchFilter } from '@/lib/db'
import { handleActionError } from '@/lib/actions/handle-action-error'

export type SelfCareActivityWithUser = SelfCareActivity & {
  user: ProfileSummary
}

type SelfCareActivityFields = {
  title: string
  date: Date
  description?: string
  medication: string
  dosage: string
}

export type CreateSelfCareActivityInput = SelfCareActivityFields & {
  userId: string
}
export type UpdateSelfCareActivityInput = Partial<SelfCareActivityFields> & {
  id: string
}

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
    ...buildSearchFilter(search, ['title', 'medication', 'dosage']),
    ...buildDateRangeFilter(dateFrom, dateTo)
  }

  try {
    const [data, total] = await prisma.$transaction([
      prisma.selfCareActivity.findMany({
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
    handleActionError(e)
  }
}

export const deleteSelfCareActivity = async (id: string) => {
  try {
    await prisma.selfCareActivity.delete({ where: { id } })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const getSelfCareActivityById = async (id: string) => {
  try {
    return await prisma.selfCareActivity.findUnique({ where: { id } })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const createSelfCareActivity = async (
  input: CreateSelfCareActivityInput
) => {
  try {
    await prisma.selfCareActivity.create({ data: input })
  }
  catch (e) {
    handleActionError(e)
  }
}

export const updateSelfCareActivity = async ({
  id,
  ...data
}: UpdateSelfCareActivityInput) => {
  try {
    await prisma.selfCareActivity.update({ where: { id }, data })
  }
  catch (e) {
    handleActionError(e)
  }
}
