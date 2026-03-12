"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/app/actions/medical-expenses";
import type { MedicalExpense } from "@/lib/generated/prisma/client";

export type MedicalExpensesParams = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  types?: string[];
};

export const medicalExpensesQueryKey = (params: MedicalExpensesParams) =>
  ["medical-expenses", params] as const;

export const useMedicalExpenses = (params: MedicalExpensesParams = {}) => {
  const { profileId, page = 1, pageSize = 10, sortField = "date", sortDirection = "desc", search = "", dateFrom, dateTo, types } = params;

  return useQuery<PaginatedResult<MedicalExpense>>({
    queryKey: medicalExpensesQueryKey(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        ...(profileId ? { profileId } : {}),
        page: String(page),
        pageSize: String(pageSize),
        sortField,
        sortDirection,
        ...(search ? { search } : {}),
        ...(dateFrom ? { dateFrom } : {}),
        ...(dateTo ? { dateTo } : {}),
        ...(types && types.length > 0 ? { types: types.join(",") } : {}),
      })
      const res = await fetch(`/api/medical-expenses?${searchParams}`);
      return res.json();
    },
  });
};
