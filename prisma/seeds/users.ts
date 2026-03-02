import { PrismaClient } from "@/lib/generated/prisma/client";

export async function seedUsers(prisma: PrismaClient) {
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        firstName: "Igor",
        lastName: "Postrygan",
        birthDate: new Date("1994-12-28"),
        weight: 89,
        height: 190,
        familyRole: "Husband",
        shortName: "Papa Gena",
        imageKey: null,
      },
      {
        firstName: "Iryna",
        lastName: "Sydorenko",
        birthDate: new Date("1994-04-14"),
        weight: 56,
        height: 170,
        familyRole: "Wife",
        shortName: "Mama Kura",
        imageKey: null,
      },
      {
        firstName: "Miguel Angel",
        lastName: "Felix Gallardo",
        birthDate: new Date("2021-09-11"),
        weight: 3,
        familyRole: "Cat",
        shortName: "Angel",
        imageKey: "angel.jpeg",
      },
    ],
  });

  console.log("Seeded 3 users.");
}
