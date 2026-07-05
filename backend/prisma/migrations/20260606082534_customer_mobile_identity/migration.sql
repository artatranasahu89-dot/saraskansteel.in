-- CreateTable
CREATE TABLE "Staff" (
    "id" TEXT NOT NULL,
    "staffCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mobile" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STAFF',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Staff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Staff_staffCode_key" ON "Staff"("staffCode");

-- CreateIndex
CREATE UNIQUE INDEX "Staff_mobile_key" ON "Staff"("mobile");
