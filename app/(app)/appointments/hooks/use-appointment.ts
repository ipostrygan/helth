"use client";

import { useQuery } from "@tanstack/react-query";
import { getAppointment, type AppointmentWithDocuments } from "@/lib/api/appointments";

export const useAppointment = (id: string) => {
  return useQuery<AppointmentWithDocuments>({
    queryKey: ["appointments", id],
    queryFn: () => getAppointment(id),
    enabled: !!id,
  });
};
