"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/table";
import type { MedicalExpense } from "@/lib/generated/prisma/client";
import { getMedicalExpenses, type MedicalExpensesParams } from "@/lib/api/medical-expenses";

export type { MedicalExpensesParams };

export const medicalExpensesQueryKey = (params: MedicalExpensesParams) =>
  ["medical-expenses", params] as const;

export const useMedicalExpenses = (params: MedicalExpensesParams = {}) => {
  return useQuery<PaginatedResult<MedicalExpense>>({
    queryKey: medicalExpensesQueryKey(params),
    queryFn: () => getMedicalExpenses(params),
  });
};
