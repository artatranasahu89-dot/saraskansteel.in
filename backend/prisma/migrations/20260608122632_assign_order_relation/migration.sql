/*
  Warnings:

  - The `status` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "transportId" TEXT,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_transportId_fkey" FOREIGN KEY ("transportId") REFERENCES "Staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;
