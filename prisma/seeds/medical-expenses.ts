import { ExpenseType, PrismaClient } from "@/lib/generated/prisma/client";
import data from "./medical-expenses.json";

export async function seedMedicalExpenses(prisma: PrismaClient, userIds: string[]) {
  await prisma.medicalExpense.createMany({
    data: data.map((row) => ({
      ...row,
      userId: userIds[row.userId - 1],
      date: new Date(row.date),
      type: row.type as ExpenseType,
    })),
  });

  console.log(`Seeded ${data.length} medical expenses.`);
}
