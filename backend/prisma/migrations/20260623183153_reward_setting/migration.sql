-- CreateTable
CREATE TABLE "RewardSetting" (
    "id" TEXT NOT NULL,
    "redemptionOpen" BOOLEAN NOT NULL DEFAULT true,
    "message" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RewardSetting_pkey" PRIMARY KEY ("id")
);
