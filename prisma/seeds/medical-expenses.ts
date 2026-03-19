import { ExpenseType, PrismaClient } from "@/lib/generated/prisma/client";
import data from "./medical-expenses.json";

export async function seedMedicalExpenses(
  prisma: PrismaClient,
  userIds: string[],
  therapyIdsByUserId: Record<string, string[]> = {}
) {
  // Track per-user expense counters to deterministically assign therapy IDs to every 3rd expense
  const userExpenseCounter: Record<string, number> = {};

  await prisma.medicalExpense.createMany({
    data: data.map((row) => {
      const userId = userIds[row.userId - 1];
      const therapies = therapyIdsByUserId[userId] ?? [];

      userExpenseCounter[userId] = (userExpenseCounter[userId] ?? 0) + 1;
      const counter = userExpenseCounter[userId];

      // Assign a therapy to every 3rd expense (if therapies exist for this user)
      const therapyId =
        therapies.length > 0 && counter % 3 === 0
          ? therapies[Math.floor(counter / 3) % therapies.length]
          : null;

      return {
        ...row,
        userId,
        therapyId,
        date: new Date(row.date),
        type: row.type as ExpenseType,
      };
    }),
  });

  console.log(`Seeded ${data.length} medical expenses.`);
}
