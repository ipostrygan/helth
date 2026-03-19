-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "therapyId" TEXT;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_therapyId_fkey" FOREIGN KEY ("therapyId") REFERENCES "Therapy"("id") ON DELETE SET NULL ON UPDATE CASCADE;
