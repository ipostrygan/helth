-- CreateTable
CREATE TABLE "MedicalExpense" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,

    CONSTRAINT "MedicalExpense_pkey" PRIMARY KEY ("id")
);
