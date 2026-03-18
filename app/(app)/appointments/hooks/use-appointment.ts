"use client";

import { useQuery } from "@tanstack/react-query";
import type { Appointment } from "@/lib/generated/prisma/client";
import { getAppointment } from "@/lib/api/appointments";

export const useAppointment = (id: string) => {
  return useQuery<Appointment>({
    queryKey: ["appointments", id],
    queryFn: () => getAppointment(id),
    enabled: !!id,
  });
};
