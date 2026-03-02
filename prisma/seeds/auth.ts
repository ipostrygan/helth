import { PrismaClient } from "@/lib/generated/prisma/client";
import bcrypt from "bcrypt";

export async function seedAuth(prisma: PrismaClient) {
  const password = process.env.SEED_PASSWORD;
  if (!password) throw new Error("SEED_PASSWORD env variable is required");

  const hash = await bcrypt.hash(password, 12);

  await prisma.auth.upsert({
    where: { username: "admin" },
    update: { password: hash },
    create: { username: "admin", password: hash },
  });

  console.log("Seeded auth credentials.");
}
