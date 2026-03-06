/*
  Warnings:

  - Added the required column `type` to the `MedicalExpense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MedicalExpense` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExpenseType" AS ENUM ('Pharmacy', 'DoctorVisit', 'Procedure', 'Dental', 'MentalHealth');

-- AlterTable
ALTER TABLE "MedicalExpense" ADD COLUMN     "type" "ExpenseType" NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "MedicalExpense" ADD CONSTRAINT "MedicalExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
