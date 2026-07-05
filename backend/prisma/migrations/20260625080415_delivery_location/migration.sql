-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "deliveryLat" DOUBLE PRECISION,
ADD COLUMN     "deliveryLng" DOUBLE PRECISION,
ADD COLUMN     "deliveryProofImage" TEXT,
ADD COLUMN     "deliveryRemark" TEXT,
ADD COLUMN     "deliveryUpdatedAt" TIMESTAMP(3);
