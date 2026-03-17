import type { PaginatedResult } from "@/types/table";
import type { MedicalExpense } from "@/lib/generated/prisma/client";

export type MedicalExpensesParams = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  types?: string[];
};

export async function getMedicalExpenses(
  params: MedicalExpensesParams
): Promise<PaginatedResult<MedicalExpense>> {
  const {
    profileId,
    page = 1,
    pageSize = 10,
    sortField = "date",
    sortDirection = "desc",
    search = "",
    dateFrom,
    dateTo,
    types,
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
    ...(types && types.length > 0 ? { types: types.join(",") } : {}),
  });

  const res = await fetch(`/api/medical-expenses?${searchParams}`);
  return res.json();
}

export async function deleteMedicalExpense(id: string): Promise<void> {
  const res = await fetch(`/api/medical-expenses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
}
