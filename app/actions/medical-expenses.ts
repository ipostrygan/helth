'use server'

import prisma from '@/lib/prisma'
import { ExpenseType, MedicalExpense } from '@/lib/generated/prisma/client'

import type { MedicalExpensesQueryParams } from '@/app/(app)/medical-expenses/types'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '@/lib/constants'
import { PaginatedResult, ProfileSummary } from '@/types'
import { buildDateRangeFilter, buildSearchFilter } from '@/lib/db'

export type MedicalExpenseWithUser = MedicalExpense & { user: ProfileSummary }

export type MedicalExpensePaginatedResult = PaginatedResult<MedicalExpenseWithUser> & {
  totalSum: number
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

type BaseExpenseInput = {
  title: string
  amount: number
  date: Date
  type: ExpenseType
  description?: string
  therapyId?: string | null
  appointmentId?: string | null
}

export type CreateExpenseInput = BaseExpenseInput & { userId: string }

export type UpdateExpenseInput = { id: string } & Partial<BaseExpenseInput>

export const getMedicalExpenses = async ({
  profileId,
  page = DEFAULT_PAGE,
  pageSize = DEFAULT_PAGE_SIZE,
  sortField = 'date',
  sortDirection = 'desc',
  search = '',
  dateFrom,
  dateTo,
  types,
  therapyId,
  appointmentId
}: MedicalExpensesQueryParams = {}) => {
  const skip = (page - 1) * pageSize

  const andConditions = [
    ...(therapyId ? [{ OR: [{ therapyId }, { appointment: { therapyId } }] }] : []),
    ...(search ? [buildSearchFilter(search, ['title', 'description'])] : [])
  ]

  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(appointmentId ? { appointmentId } : {}),
    ...buildDateRangeFilter(dateFrom, dateTo),
    ...(types && types.length > 0 ? { type: { in: types as ExpenseType[] } } : {}),
    ...(andConditions.length > 0 ? { AND: andConditions } : {})
  }

  try {
    const [data, total, aggregate] = await prisma.$transaction([
      prisma.medicalExpense.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { [sortField]: sortDirection },
        include: { user: { select: { firstName: true, shortName: true, profileType: true } } }
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

export const getMedicalExpensesByType = async ({
  profileId,
  dateFrom,
  dateTo
}: ExpensesByTypeQuery = {}) => {
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

export const getMedicalExpenseById = async (id: string) => {
  try {
    return await prisma.medicalExpense.findUnique({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to fetch medical expense')
  }
}

export const deleteExpense = async (id: string) => {
  try {
    await prisma.medicalExpense.delete({ where: { id } })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to delete expense')
  }
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

export const updateExpense = async ({ id, ...data }: UpdateExpenseInput) => {
  try {
    await prisma.medicalExpense.update({ where: { id }, data })
  }
  catch (e) {
    console.error(e)
    throw new Error(e instanceof Error ? e.message : 'Failed to update expense')
  }
}
