"use server";

import prisma from "@/lib/prisma";
import { ExpenseType, MedicalExpense } from "@/lib/generated/prisma/client";
import { SortDirection } from "@tanstack/react-table";
import type { PaginatedResult } from "@/types/table";

export type MedicalExpensesQuery = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: keyof MedicalExpense;
  sortDirection?: SortDirection
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  types?: string[];
};

export const getMedicalExpenses = async ({
  profileId,
  page = 1,
  pageSize = 10,
  sortField = "date",
  sortDirection = "desc",
  search = "",
  dateFrom,
  dateTo,
  types,
}: MedicalExpensesQuery = {}): Promise<PaginatedResult<MedicalExpense>> => {
  const skip = (page - 1) * pageSize;
  const where = {
    ...(profileId ? { userId: profileId } : {}),
    ...(search ? {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    } : {}),
    ...(dateFrom || dateTo ? {
      date: {
        ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
        ...(dateTo ? { lte: new Date(dateTo) } : {}),
      },
    } : {}),
    ...(types && types.length > 0 ? { type: { in: types as ExpenseType[] } } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.medicalExpense.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { [sortField]: sortDirection },
    }),
    prisma.medicalExpense.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};

export type ExpensesByTypeItem = {
  type: ExpenseType;
  total: number;
  count: number;
};

export type ExpensesByTypeQuery = {
  profileId?: string;
  dateFrom?: string;
  dateTo?: string;
};

export const getMedicalExpensesByType = async ({
  profileId,
  dateFrom,
  dateTo,
}: ExpensesByTypeQuery = {}): Promise<ExpensesByTypeItem[]> => {
  const defaultDateFrom = new Date();
  defaultDateFrom.setMonth(defaultDateFrom.getMonth() - 1);

  const resolvedDateFrom = dateFrom ? new Date(dateFrom) : defaultDateFrom;
  const resolvedDateTo = dateTo ? new Date(dateTo) : new Date();

  const grouped = await prisma.medicalExpense.groupBy({
    by: ["type"],
    where: {
      ...(profileId ? { userId: profileId } : {}),
      date: {
        gte: resolvedDateFrom,
        lte: resolvedDateTo,
      },
    },
    _sum: { amount: true },
    _count: { id: true },
  });

  return grouped.map((g) => ({
    type: g.type,
    total: g._sum.amount ?? 0,
    count: g._count.id,
  }));
};

export const deleteExpense = async (id: string): Promise<void> => {
  await prisma.medicalExpense.delete({ where: { id } });
};

export type CreateExpenseInput = {
  userId: string;
  title: string;
  amount: number;
  date: Date;
  type: ExpenseType;
  description?: string;
};

export const createExpense = async (input: CreateExpenseInput) => {
  try {
    await prisma.medicalExpense.create({ data: input });
  } catch (e) {
    console.error(e);
    throw new Error(e instanceof Error ? e.message : "Failed to create expense");
  }
};

export type UpdateExpenseInput = {
  id: string;
  title: string;
  amount: number;
  date: Date;
  type: ExpenseType;
  description?: string;
};

export const updateExpense = async ({ id, ...data }: UpdateExpenseInput) => {
  try {
    await prisma.medicalExpense.update({ where: { id }, data });
  } catch (e) {
    console.error(e);
    throw new Error(e instanceof Error ? e.message : "Failed to update expense");
  }
};
