import { PrismaClient } from "@/lib/generated/prisma/client";
import data from "./therapies.json";

// Maps the hardcoded placeholder UUIDs in therapies.json to user indices (0-based)
const THERAPY_USER_ID_MAP: Record<string, number> = {
  "47aed416-5118-4426-9bf9-332333a46aa0": 0,
  "1b835d77-2aea-491f-a163-ec9627e4b719": 1,
};

export type TherapySeedResult = {
  therapyIdsByUserId: Record<string, string[]>;
  therapyIdByTitle: Record<string, string>;
};

export async function seedTherapies(
  prisma: PrismaClient,
  userIds: string[]
): Promise<TherapySeedResult> {
  await prisma.therapy.createMany({
    data: data.map((row) => ({
      ...row,
      userId: userIds[THERAPY_USER_ID_MAP[row.userId] ?? 0],
      startDate: new Date(row.startDate),
      endDate: row.endDate ? new Date(row.endDate) : null,
    })),
  });

  // Query back IDs grouped by userId (for expenses) and by title (for appointments)
  const therapies = await prisma.therapy.findMany({
    select: { id: true, userId: true, title: true },
  });

  const therapyIdsByUserId: Record<string, string[]> = {};
  const therapyIdByTitle: Record<string, string> = {};

  for (const t of therapies) {
    if (!therapyIdsByUserId[t.userId]) therapyIdsByUserId[t.userId] = [];
    therapyIdsByUserId[t.userId].push(t.id);
    therapyIdByTitle[t.title] = t.id;
  }

  console.log(`Seeded ${data.length} therapies.`);
  return { therapyIdsByUserId, therapyIdByTitle };
}
