import type { BaseQueryParams } from "@/types/queries";

export type MedicalExpensesQueryParams = BaseQueryParams & {
  types?: string[];
  therapyId?: string;
};
