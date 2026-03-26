"use client";

import { useQuery } from "@tanstack/react-query";
import type { MedicalExpense } from "@/lib/generated/prisma/client";
import { getMedicalExpense } from "@/lib/api/medical-expenses";

export const useMedicalExpense = (id: string) => {
  return useQuery<MedicalExpense>({
    queryKey: ["medical-expenses", id],
    queryFn: () => getMedicalExpense(id),
    enabled: !!id,
  });
};
