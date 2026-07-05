-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "collectionRemark" TEXT,
ADD COLUMN     "collectionStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "expectedPaymentDate" TIMESTAMP(3);
