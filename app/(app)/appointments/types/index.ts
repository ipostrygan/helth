import type { BaseQueryParams } from "@/types/queries";

export type AppointmentsQueryParams = BaseQueryParams & {
  statuses?: string[];
  therapyId?: string;
};
