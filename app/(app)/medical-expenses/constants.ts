import { ExpenseType } from "@/lib/generated/prisma/enums"

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  Pharmacy:    "Pharmacy",
  DoctorVisit: "Doctor visit",
  Procedure:   "Procedure",
  Dental:      "Dental",
  MentalHealth: "Mental health",
}
