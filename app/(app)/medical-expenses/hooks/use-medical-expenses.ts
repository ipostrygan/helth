"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/table";
import type { MedicalExpenseWithRelations } from "@/app/actions/medical-expenses";
import { getMedicalExpenses, type MedicalExpensesParams } from "@/lib/api/medical-expenses";

export type { MedicalExpensesParams };

export const medicalExpensesQueryKey = (params: MedicalExpensesParams) =>
  ["medical-expenses", params] as const;

export const useMedicalExpenses = (params: MedicalExpensesParams = {}) => {
  return useQuery<PaginatedResult<MedicalExpenseWithRelations>>({
    queryKey: medicalExpensesQueryKey(params),
    queryFn: () => getMedicalExpenses(params),
    placeholderData: keepPreviousData,
  });
};
