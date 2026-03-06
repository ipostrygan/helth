"use server";

import prisma from "@/lib/prisma";
import { MedicalExpense } from "@/lib/generated/prisma/client";

export type PaginatedResult<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export const getMedicalExpenses = async (
  page = 1,
  pageSize = 10
): Promise<PaginatedResult<MedicalExpense>> => {
  const skip = (page - 1) * pageSize;

  const [data, total] = await prisma.$transaction([
    prisma.medicalExpense.findMany({
      skip,
      take: pageSize,
      orderBy: { date: "desc" },
    }),
    prisma.medicalExpense.count(),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
};
