-- CreateEnum
CREATE TYPE "ProfileType" AS ENUM ('Human', 'Animal');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "profileType" "ProfileType" NOT NULL DEFAULT 'Human',
ALTER COLUMN "firstName" DROP NOT NULL,
ALTER COLUMN "lastName" DROP NOT NULL;

ALTER TABLE "User" ADD CONSTRAINT "user_profile_fields_check" CHECK (
  ("profileType" = 'Human' AND "firstName" IS NOT NULL AND "lastName" IS NOT NULL AND "fullName" IS NULL) OR
  ("profileType" = 'Animal' AND "fullName" IS NOT NULL AND "firstName" IS NULL AND "lastName" IS NULL)
);
