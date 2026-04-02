import { AppointmentStatus, AppointmentType, PrismaClient } from '@/lib/generated/prisma/client'
import data from './appointments.json'

export async function seedAppointments(
  prisma: PrismaClient,
  userIds: string[],
  therapyIdByTitle: Record<string, string>
) {
  await prisma.appointment.deleteMany()

  await prisma.appointment.createMany({
    data: data.map(row => ({
      title: row.title,
      description: row.description ?? null,
      date: new Date(row.date),
      endDate: row.endDate ? new Date(row.endDate) : null,
      type: row.type as AppointmentType,
      status: row.status as AppointmentStatus,
      doctorName: row.doctorName ?? null,
      location: row.location ?? null,
      notes: row.notes ?? null,
      relatedDocuments: row.relatedDocuments,
      userId: userIds[row.userId - 1],
      therapyId: 'therapyTitle' in row && row.therapyTitle
        ? (therapyIdByTitle[row.therapyTitle as string] ?? null)
        : null
    }))
  })

  console.log(`Seeded ${data.length} appointments.`)
}
