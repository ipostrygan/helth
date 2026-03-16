import { PrismaClient } from "@/lib/generated/prisma/client";
import { seedUsers } from "./seeds/users";

const prisma = new PrismaClient();

seedUsers(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
