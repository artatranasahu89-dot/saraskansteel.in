/*
  Warnings:

  - You are about to drop the column `customerCode` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `Customer` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[customerNumber]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mobile]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Customer_customerCode_key";

-- AlterTable
ALTER TABLE "Customer" DROP COLUMN "customerCode",
DROP COLUMN "phone",
ADD COLUMN     "createdById" TEXT,
ADD COLUMN     "customerNumber" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Customer_customerNumber_key" ON "Customer"("customerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_mobile_key" ON "Customer"("mobile");
