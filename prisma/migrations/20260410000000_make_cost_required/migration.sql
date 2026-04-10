-- Fill existing NULLs before making the column required
UPDATE "Appointment" SET "cost" = 0 WHERE "cost" IS NULL;

-- AlterTable
ALTER TABLE "Appointment" ALTER COLUMN "cost" SET NOT NULL;
