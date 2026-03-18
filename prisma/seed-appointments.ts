import { PrismaClient } from "@/lib/generated/prisma/client";
import { seedAppointments } from "./seeds/appointments";

const prisma = new PrismaClient();

async function main() {
  const [igor, iryna, angel] = await Promise.all([
    prisma.user.findFirstOrThrow({ where: { firstName: "Igor" } }),
    prisma.user.findFirstOrThrow({ where: { firstName: "Iryna" } }),
    prisma.user.findFirstOrThrow({ where: { firstName: "Miguel Angel" } }),
  ]);
  const userIds = [igor.id, iryna.id, angel.id];
  await seedAppointments(prisma, userIds);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
