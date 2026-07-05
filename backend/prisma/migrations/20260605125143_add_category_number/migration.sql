/*
  Warnings:

  - A unique constraint covering the columns `[categoryNumber]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "categoryNumber" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Category_categoryNumber_key" ON "Category"("categoryNumber");
