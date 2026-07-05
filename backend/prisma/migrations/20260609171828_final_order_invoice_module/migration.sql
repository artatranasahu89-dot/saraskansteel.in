/*
  Warnings:

  - You are about to drop the column `outstanding` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paidAmount` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `Order` table. All the data in the column will be lost.
  - The `labourType` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "outstandingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "outstanding",
DROP COLUMN "paidAmount",
DROP COLUMN "paymentStatus";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "totalAmount",
ADD COLUMN     "amountPaidToday" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "deliveredAt" TIMESTAMP(3),
ADD COLUMN     "invoiceValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nowOutstanding" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "paymentDate" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "previousOutstanding" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "userId" TEXT,
ALTER COLUMN "customerId" DROP NOT NULL,
DROP COLUMN "labourType",
ADD COLUMN     "labourType" TEXT NOT NULL DEFAULT 'NONE';

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
