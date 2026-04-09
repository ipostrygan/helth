'use server'

import prisma from '@/lib/prisma'
import { ExpenseType, MedicalExpense } from '@/lib/generated/prisma/client'

import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'

export type MedicalExpenseWithRelations = MedicalExpense & {
  therapy: { id: string, title: string } | null
  appointment: { id: string, title: string } | null
}

export type MedicalExpensePaginatedResult = {
  data: MedicalExpenseWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  totalSum: number
}

export const getMedicalExpenses = async ({
  profileId,
  page = 1,
  pageSize = 10,
  sortField = 'date',
  sortDirection = 'desc',
  search = '',
  dateFrom,
  dateTo,
  types,
  therapyId,
  appointmentId
}: MedicalExpensesQueryParams = {}): Promise<MedicalExpensePaginatedResult> => {
  const skip = (page - 1) * pageSize
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(therapyId ? { therapyId } : {}),
    ...(appointmentId ? { appointmentId } : {}),
    ...(search
      ? {
          OR: [
            { title: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } }
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
    ...(types && types.length > 0 ? { type: { in: types as ExpenseType[] } } : {})
  }

  try {
    const [data, total, aggregate] = await prisma.$transaction([
      prisma.medicalExpense.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection },
        include: {
          therapy: { select: { id: true, title: true } },
          appointment: { select: { id: true, title: true } }
        }
      }),
      prisma.medicalExpense.count({ where }),
      prisma.medicalExpense.aggregate({ where, _sum: { amount: true } })
    ])

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      totalSum: aggregate._sum.amount ?? 0
    }
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch medical expenses')
  }
}

export type ExpensesByTypeItem = {
  type: ExpenseType
  total: number
  count: number
}

export type ExpensesByTypeQuery = {
  profileId?: string
  dateFrom?: string
  dateTo?: string
}

export const getMedicalExpensesByType = async ({
  profileId,
  dateFrom,
  dateTo
}: ExpensesByTypeQuery = {}): Promise<ExpensesByTypeItem[]> => {
  const defaultDateFrom = new Date()
  defaultDateFrom.setMonth(defaultDateFrom.getMonth() - 1)

  const resolvedDateFrom = dateFrom ? new Date(dateFrom) : defaultDateFrom
  const resolvedDateTo = dateTo ? new Date(dateTo) : new Date()

  try {
    const grouped = await prisma.medicalExpense.groupBy({
      by: ['type'],
      where: {
        ...(profileId ? { userId: profileId } : {}),
        date: {
          gte: resolvedDateFrom,
          lte: resolvedDateTo
        }
      },
      _sum: { amount: true },
      _count: { id: true }
    })

    return grouped.map(g => ({
      type: g.type,
      total: g._sum.amount ?? 0,
      count: g._count.id
    }))
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch medical expenses by type')
  }
}

export const getMedicalExpenseById = async (id: string): Promise<MedicalExpense | null> => {
  try {
    return await prisma.medicalExpense.findUnique({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch medical expense')
  }
}

export const deleteExpense = async (id: string): Promise<void> => {
  try {
    await prisma.medicalExpense.delete({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to delete expense')
  }
}

export type CreateExpenseInput = {
  userId: string
  title: string
  amount: number
  date: Date
  type: ExpenseType
  description?: string
  therapyId?: string | null
  appointmentId?: string | null
}

export const createExpense = async (input: CreateExpenseInput) => {
  try {
    await prisma.medicalExpense.create({ data: input })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to create expense')
  }
}

export type UpdateExpenseInput = {
  id: string
  title: string
  amount: number
  date: Date
  type: ExpenseType
  description?: string
  therapyId?: string | null
  appointmentId?: string | null
}

export const updateExpense = async ({ id, ...data }: UpdateExpenseInput) => {
  try {
    await prisma.medicalExpense.update({ where: { id }, data })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to update expense')
  }
}
