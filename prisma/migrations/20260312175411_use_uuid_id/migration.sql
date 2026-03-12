/*
  Warnings:

  - The primary key for the `Auth` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `MedicalExpense` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "MedicalExpense" DROP CONSTRAINT "MedicalExpense_userId_fkey";

-- AlterTable
ALTER TABLE "Auth" DROP CONSTRAINT "Auth_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Auth_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Auth_id_seq";

-- AlterTable
ALTER TABLE "MedicalExpense" DROP CONSTRAINT "MedicalExpense_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "MedicalExpense_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "MedicalExpense_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AddForeignKey
ALTER TABLE "MedicalExpense" ADD CONSTRAINT "MedicalExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
