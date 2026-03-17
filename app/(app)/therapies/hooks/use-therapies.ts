"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/table";
import type { Therapy } from "@/lib/generated/prisma/client";
import { getTherapies, type TherapiesParams } from "@/lib/api/therapies";

export type { TherapiesParams };

export const therapiesQueryKey = (params: TherapiesParams) =>
  ["therapies", params] as const;

export const useTherapies = (params: TherapiesParams = {}) => {
  return useQuery<PaginatedResult<Therapy>>({
    queryKey: therapiesQueryKey(params),
    queryFn: () => getTherapies(params),
  });
};
