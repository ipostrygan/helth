-- Cast column to text so we can drop and recreate the enum
ALTER TABLE "Appointment" ALTER COLUMN "type" TYPE TEXT;

-- Migrate old values before dropping the type
UPDATE "Appointment" SET "type" = 'Primary'   WHERE "type" = 'GeneralPractitioner';
UPDATE "Appointment" SET "type" = 'Secondary' WHERE "type" = 'Specialist';
UPDATE "Appointment" SET "type" = 'Lab'       WHERE "type" = 'Imaging';

DROP TYPE "AppointmentType";

CREATE TYPE "AppointmentType" AS ENUM (
  'Primary',
  'Secondary',
  'Dental',
  'MentalHealth',
  'Lab',
  'Emergency',
  'FollowUp',
  'Vaccination',
  'Other'
);

ALTER TABLE "Appointment" ALTER COLUMN "type" TYPE "AppointmentType" USING "type"::"AppointmentType";
