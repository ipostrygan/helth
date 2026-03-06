"use client";

import { useQuery } from "@tanstack/react-query";
import { PaginatedResult } from "@/app/actions/medical-expenses";
import { MedicalExpense } from "@/lib/generated/prisma/client";

export type MedicalExpensesParams = {
  page?: number;
  pageSize?: number;
};

export const medicalExpensesQueryKey = (params: MedicalExpensesParams) =>
  ["medical-expenses", params] as const;

export const useMedicalExpenses = (params: MedicalExpensesParams = {}) => {
  const { page = 1, pageSize = 10 } = params;

  return useQuery<PaginatedResult<MedicalExpense>>({
    queryKey: medicalExpensesQueryKey(params),
    queryFn: async () => {
      const res = await fetch(`/api/medical-expenses?page=${page}&pageSize=${pageSize}`);
      return res.json();
    },
  });
};
