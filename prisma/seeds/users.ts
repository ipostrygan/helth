import { PrismaClient } from "@/lib/generated/prisma/client";

export async function seedUsers(prisma: PrismaClient): Promise<string[]> {
  await prisma.user.deleteMany();

  const u1 = await prisma.user.create({
    data: {
      firstName: "Igor",
      lastName: "Postrygan",
      birthDate: new Date("1994-12-28"),
      weight: 89,
      height: 190,
      familyRole: "Husband",
      shortName: "Papa Gena",
      imageKey: null,
      isPrimaryUser: true,
    },
  });

  const u2 = await prisma.user.create({
    data: {
      firstName: "Iryna",
      lastName: "Sydorenko",
      birthDate: new Date("1994-04-14"),
      weight: 56,
      height: 170,
      familyRole: "Wife",
      shortName: "Mama Kura",
      imageKey: null,
    },
  });

  const u3 = await prisma.user.create({
    data: {
      firstName: "Miguel Angel",
      lastName: "Felix Gallardo",
      birthDate: new Date("2021-09-11"),
      weight: 3,
      familyRole: "Cat",
      shortName: "Angel",
      imageKey: "angel.jpeg",
    },
  });

  console.log("Seeded 3 users.");
  return [u1.id, u2.id, u3.id];
}
