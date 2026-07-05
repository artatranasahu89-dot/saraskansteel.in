-- CreateEnum
CREATE TYPE "LabourType" AS ENUM ('NONE', 'LOADING', 'UNLOADING', 'BOTH');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "labourAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "labourType" "LabourType" NOT NULL DEFAULT 'NONE';
