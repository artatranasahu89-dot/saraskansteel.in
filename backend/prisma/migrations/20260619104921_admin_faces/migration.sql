-- CreateTable
CREATE TABLE "AdminFace" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "faceName" TEXT NOT NULL,
    "faceEncoding" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminFace_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminFace_userId_idx" ON "AdminFace"("userId");

-- AddForeignKey
ALTER TABLE "AdminFace" ADD CONSTRAINT "AdminFace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
