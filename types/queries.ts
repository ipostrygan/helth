import type { SortDirection } from "@/types/table";

export type BaseQueryParams = {
  profileId?: string;
  page?: number;
  pageSize?: number;
  sortField?: string;
  sortDirection?: SortDirection;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
};

