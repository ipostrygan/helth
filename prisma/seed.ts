import { PrismaClient } from "@/lib/generated/prisma/client";
import { seedAuth } from "./seeds/auth";
import { seedMedicalExpenses } from "./seeds/medical-expenses";
import { seedTherapies } from "./seeds/therapies";
import { seedUsers } from "./seeds/users";
import { seedAppointments } from "./seeds/appointments";

const prisma = new PrismaClient();

async function main() {
  await seedAuth(prisma);
  const userIds = await seedUsers(prisma);
  const { therapyIdsByUserId, therapyIdByTitle } = await seedTherapies(prisma, userIds);
  await seedMedicalExpenses(prisma, userIds, therapyIdsByUserId);
  await seedAppointments(prisma, userIds, therapyIdByTitle);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
