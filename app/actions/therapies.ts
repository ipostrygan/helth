'use server'

import prisma from '@/lib/prisma'
import { Therapy } from '@/lib/generated/prisma/client'
import type { PaginatedResult } from '@/types/table'
import type { TherapiesQueryParams } from '@/app/(app)/therapies/types'

export type TherapiesQuery = TherapiesQueryParams

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
}: TherapiesQuery = {}): Promise<PaginatedResult<Therapy>> => {
  const skip = (page - 1) * pageSize
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { therapistName: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } }
          ]
        }
      : {}),
    ...(dateFrom || dateTo
      ? {
          startDate: {
            ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
            ...(dateTo ? { lte: new Date(dateTo) } : {})
          }
        }
      : {}),
    ...(isActive && isActive.length === 1 ? { isActive: isActive[0] === 'true' } : {})
  }

  const [data, total] = await prisma.$transaction([
    prisma.therapy.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortDirection }
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

export const deleteTherapy = async (id: string): Promise<void> => {
  await prisma.therapy.delete({ where: { id } })
}

export type CreateTherapyInput = {
  userId: string
  title: string
  description?: string
  startDate: Date
  endDate?: Date
  therapistName?: string
  therapistInfoLink?: string
  location?: string
  isActive: boolean
}

export const createTherapy = async (input: CreateTherapyInput): Promise<void> => {
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
  therapistName?: string
  therapistInfoLink?: string
  location?: string
  isActive?: boolean
}

export const updateTherapy = async ({ id, ...data }: UpdateTherapyInput): Promise<void> => {
  try {
    await prisma.therapy.update({ where: { id }, data })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to update therapy')
  }
}

export const getTherapyById = async (id: string): Promise<Therapy | null> => {
  return prisma.therapy.findUnique({ where: { id } })
}

export const addDocumentToTherapy = async (id: string, key: string): Promise<void> => {
  await prisma.therapy.update({
    where: { id },
    data: { relatedDocuments: { push: key } }
  })
}

export const removeDocumentFromTherapy = async (id: string, key: string): Promise<void> => {
  const therapy = await prisma.therapy.findUnique({ where: { id }, select: { relatedDocuments: true } })
  if (!therapy) return
  await prisma.therapy.update({
    where: { id },
    data: { relatedDocuments: therapy.relatedDocuments.filter(k => k !== key) }
  })
}
