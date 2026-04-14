/*
  Warnings:

  - The values [Cancelled,NoShow] on the enum `AppointmentStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AppointmentStatus_new" AS ENUM ('Scheduled', 'Completed');
ALTER TABLE "public"."Appointment" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Appointment" ALTER COLUMN "status" TYPE "AppointmentStatus_new" USING ("status"::text::"AppointmentStatus_new");
ALTER TYPE "AppointmentStatus" RENAME TO "AppointmentStatus_old";
ALTER TYPE "AppointmentStatus_new" RENAME TO "AppointmentStatus";
DROP TYPE "public"."AppointmentStatus_old";
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'Scheduled';
COMMIT;

-- CreateTable
CREATE TABLE "SelfCareActivity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "medication" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SelfCareActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SelfCareActivity" ADD CONSTRAINT "SelfCareActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
