import type { PaginatedResult } from "@/app/actions/medical-expenses";
import type { Therapy } from "@/lib/generated/prisma/client";

export type TherapiesParams = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  isActive?: string[];
};

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
