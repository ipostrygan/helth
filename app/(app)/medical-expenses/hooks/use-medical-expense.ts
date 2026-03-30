"use client";

import { useQuery } from "@tanstack/react-query";
import type { MedicalExpense } from "@/lib/generated/prisma/client";
import { getMedicalExpense } from "@/lib/api/medical-expenses";
import { queryKeys } from "@/lib/query-keys";

export const useMedicalExpense = (id: string) => {
  return useQuery<MedicalExpense>({
    queryKey: queryKeys.medicalExpenses.detail(id),
    queryFn: () => getMedicalExpense(id),
    enabled: !!id,
  });
};
