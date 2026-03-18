import type { PaginatedResult } from "@/types/table";
import type { AppointmentsQueryParams } from "@/app/(app)/appointments/types";
import type { Appointment } from "@/lib/generated/prisma/client";

export type AppointmentsParams = AppointmentsQueryParams;

export async function getAppointments(
  params: AppointmentsParams
): Promise<PaginatedResult<Appointment>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = "date",
    sortDirection = "desc",
    search = "",
    dateFrom,
    dateTo,
    statuses,
  } = params;

  const searchParams = new URLSearchParams({
    ...(profileId ? { profileId } : {}),
    page: String(page),
    pageSize: String(pageSize),
    sortField,
    sortDirection,
    ...(search ? { search } : {}),
    ...(dateFrom ? { dateFrom } : {}),
    ...(dateTo ? { dateTo } : {}),
    ...(statuses && statuses.length > 0 ? { statuses: statuses.join(",") } : {}),
  });

  const res = await fetch(`/api/appointments?${searchParams}`);
  return res.json();
}

export async function deleteAppointment(id: string): Promise<void> {
  const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete appointment");
}

export async function getAppointment(id: string): Promise<Appointment> {
  const res = await fetch(`/api/appointments/${id}`);
  if (!res.ok) throw new Error("Failed to fetch appointment");
  return res.json();
}
