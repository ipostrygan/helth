import { PrismaClient } from "@/lib/generated/prisma/client";

export async function seedMedicalExpenses(prisma: PrismaClient) {
  await prisma.medicalExpense.deleteMany();

  await prisma.medicalExpense.createMany({
    data: [
      {
        title: "General checkup",
        amount: 150,
        date: new Date("2025-01-10"),
        description: "Annual physical examination",
      },
      {
        title: "Blood test",
        amount: 80,
        date: new Date("2025-02-03"),
        description: null,
      },
    ],
  });

  console.log("Seeded 2 medical expenses.");
}
