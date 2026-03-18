import type { BaseQueryParams } from "@/types/queries";

export type TherapiesQueryParams = BaseQueryParams & {
  isActive?: string[];
};
