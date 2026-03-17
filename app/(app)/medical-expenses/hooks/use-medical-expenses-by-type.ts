"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getMedicalExpensesByType,
  type ExpensesByTypeItem,
  type ExpensesByTypeQuery,
} from "@/app/actions/medical-expenses";

export const medicalExpensesByTypeQueryKey = (params: ExpensesByTypeQuery) =>
  ["medical-expenses-by-type", params] as const;

export const useMedicalExpensesByType = (params: ExpensesByTypeQuery = {}) => {
  return useQuery<ExpensesByTypeItem[]>({
    queryKey: medicalExpensesByTypeQueryKey(params),
    queryFn: () => getMedicalExpensesByType(params),
  });
};
