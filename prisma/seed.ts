import { PrismaClient } from "@/lib/generated/prisma/client";
import "dotenv/config";
import { seedAuth } from "./seeds/auth";
import { seedMedicalExpenses } from "./seeds/medical-expenses";
import { seedUsers } from "./seeds/users";

const prisma = new PrismaClient();

async function main() {
  await seedAuth(prisma);
  const userIds = await seedUsers(prisma);
  await seedMedicalExpenses(prisma, userIds);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
