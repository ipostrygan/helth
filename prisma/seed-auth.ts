import { PrismaClient } from "@/lib/generated/prisma/client";
import { seedAuth } from "./seeds/auth";

const prisma = new PrismaClient();

seedAuth(prisma)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
