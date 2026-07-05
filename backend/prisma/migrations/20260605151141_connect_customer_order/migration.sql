-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "customerRecordId" TEXT;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerRecordId_fkey" FOREIGN KEY ("customerRecordId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
