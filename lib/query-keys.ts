import type { AppointmentsParams } from "@/lib/api/appointments";
import type { TherapiesParams } from "@/lib/api/therapies";
import type { MedicalExpensesParams } from "@/lib/api/medical-expenses";
import type { ExpensesByTypeQuery } from "@/app/actions/medical-expenses";

export const queryKeys = {
  appointments: {
    all: ["appointments"] as const,
    list: (params: AppointmentsParams) => ["appointments", params] as const,
    detail: (id: string) => ["appointments", id] as const,
  },
  therapies: {
    all: ["therapies"] as const,
    list: (params: TherapiesParams) => ["therapies", params] as const,
    detail: (id: string) => ["therapies", id] as const,
  },
  medicalExpenses: {
    all: ["medical-expenses"] as const,
    list: (params: MedicalExpensesParams) => ["medical-expenses", params] as const,
    detail: (id: string) => ["medical-expenses", id] as const,
    byType: (params: ExpensesByTypeQuery) => ["medical-expenses-by-type", params] as const,
  },
  profile: {
    all: ["profile"] as const,
    detail: (id: string | null) => ["profile", id] as const,
  },
};
