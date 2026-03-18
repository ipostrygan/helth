"use client";

import { useQuery } from "@tanstack/react-query";
import type { PaginatedResult } from "@/types/table";
import type { Appointment } from "@/lib/generated/prisma/client";
import { getAppointments, type AppointmentsParams } from "@/lib/api/appointments";

export type { AppointmentsParams };

export const appointmentsQueryKey = (params: AppointmentsParams) =>
  ["appointments", params] as const;

export const useAppointments = (params: AppointmentsParams = {}) => {
  return useQuery<PaginatedResult<Appointment>>({
    queryKey: appointmentsQueryKey(params),
    queryFn: () => getAppointments(params),
  });
};
