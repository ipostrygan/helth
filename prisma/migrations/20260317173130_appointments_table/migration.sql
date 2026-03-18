-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('GeneralPractitioner', 'Specialist', 'Dental', 'MentalHealth', 'Lab', 'Imaging', 'Emergency', 'FollowUp', 'Vaccination', 'Other');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('Scheduled', 'Completed', 'Cancelled', 'NoShow');

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'Scheduled',
    "doctorName" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "relatedDocuments" TEXT[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
