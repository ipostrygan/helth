import { PrismaClient } from "@/lib/generated/prisma/client";
import data from "./therapies.json";

export async function seedTherapies(prisma: PrismaClient) {
  await prisma.therapy.createMany({
    data: data.map((row) => ({
      ...row,
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : null,
    })),
  });

  console.log(`Seeded ${data.length} therapies.`);
}
