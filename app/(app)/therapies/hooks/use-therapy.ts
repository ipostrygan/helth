"use client";

import { useQuery } from "@tanstack/react-query";
import type { Therapy } from "@/lib/generated/prisma/client";
import { getTherapy } from "@/lib/api/therapies";

export const useTherapy = (id: string) => {
  return useQuery<Therapy>({
    queryKey: ["therapies", id],
    queryFn: () => getTherapy(id),
    enabled: !!id,
  });
};
