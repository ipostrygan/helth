import { PrismaClient } from '@/lib/generated/prisma/client'
import data from './self-care-activities.json'

export async function seedSelfCareActivities(
  prisma: PrismaClient,
  _userIds: string[]
) {
  await prisma.selfCareActivity.deleteMany()

  await prisma.selfCareActivity.createMany({
    data: data.map(row => ({
      title: row.title,
      date: new Date(row.date),
      description: row.description ?? null,
      medication: row.medication,
      dosage: row.dosage,
      userId: row.userId
    }))
  })

  console.log(`Seeded ${data.length} self-care activities.`)
}
