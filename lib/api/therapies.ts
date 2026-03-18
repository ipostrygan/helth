import type { PaginatedResult } from "@/types/table";
import type { TherapiesQueryParams } from "@/app/(app)/therapies/types";
import type { Therapy } from "@/lib/generated/prisma/client";

export type TherapiesParams = TherapiesQueryParams;

export async function getTherapies(
  params: TherapiesParams
): Promise<PaginatedResult<Therapy>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = "startDate",
    sortDirection = "desc",
    search = "",
    dateFrom,
    dateTo,
    isActive,
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
  });

  if (isActive && isActive.length > 0) {
    isActive.forEach((v) => searchParams.append("isActive", v));
  }

  const res = await fetch(`/api/therapies?${searchParams}`);
  return res.json();
}

export async function deleteTherapy(id: string): Promise<void> {
  const res = await fetch(`/api/therapies/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete therapy");
}

export async function getTherapy(id: string): Promise<Therapy> {
  const res = await fetch(`/api/therapies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch therapy");
  return res.json();
}
