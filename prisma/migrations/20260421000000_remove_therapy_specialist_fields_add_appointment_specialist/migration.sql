-- AlterTable
ALTER TABLE "Appointment" DROP COLUMN "doctorName",
ADD COLUMN "specialistLink" TEXT,
ADD COLUMN "specialistName" TEXT;

-- AlterTable
ALTER TABLE "Therapy" DROP COLUMN "location",
DROP COLUMN "therapistInfoLink",
DROP COLUMN "therapistName";
