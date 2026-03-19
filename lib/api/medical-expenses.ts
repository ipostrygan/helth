import type { PaginatedResult } from "@/types/table";
import type { MedicalExpensesQueryParams } from "@/app/(app)/medical-expenses/types";
import type { MedicalExpense } from "@/lib/generated/prisma/client";

export type MedicalExpensesParams = MedicalExpensesQueryParams;

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
    therapyId,
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
    ...(therapyId ? { therapyId } : {}),
  });

  const res = await fetch(`/api/medical-expenses?${searchParams}`);
  return res.json();
}

export async function deleteMedicalExpense(id: string): Promise<void> {
  const res = await fetch(`/api/medical-expenses/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete expense");
}
