-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryFailedAt" TIMESTAMP(3),
ADD COLUMN     "deliveryLocation" TEXT,
ADD COLUMN     "deliveryNote" TEXT,
ADD COLUMN     "deliveryStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "outForDeliveryAt" TIMESTAMP(3);
