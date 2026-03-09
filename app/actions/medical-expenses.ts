"use server";

import prisma from "@/lib/prisma";
import { ExpenseType, MedicalExpense } from "@/lib/generated/prisma/client";
import { SortDirection } from "@tanstack/react-table";

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type MedicalExpensesQuery = {
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

export const deleteExpense = async (id: number): Promise<void> => {
  await prisma.medicalExpense.delete({ where: { id } });
};
