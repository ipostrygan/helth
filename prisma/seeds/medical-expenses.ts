import { PrismaClient } from "@/lib/generated/prisma/client";
import data from "./medical-expenses.json";

export async function seedMedicalExpenses(prisma: PrismaClient) {
  await prisma.$executeRaw`TRUNCATE TABLE "MedicalExpense" RESTART IDENTITY CASCADE`;

  await prisma.medicalExpense.createMany({
    data: data.map((row) => ({ ...row, date: new Date(row.date) })),
  });

  console.log(`Seeded ${data.length} medical expenses.`);
}
