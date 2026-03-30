"use client";

import { useQuery } from "@tanstack/react-query";
import { getTherapy, type TherapyWithDocuments } from "@/lib/api/therapies";

export const useTherapy = (id: string) => {
  return useQuery<TherapyWithDocuments>({
    queryKey: ["therapies", id],
    queryFn: () => getTherapy(id),
    enabled: !!id,
  });
};
