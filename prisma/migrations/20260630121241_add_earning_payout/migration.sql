/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Earning` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Earning` table. All the data in the column will be lost.
  - You are about to drop the column `grossAmount` on the `Earning` table. All the data in the column will be lost.
  - You are about to drop the column `netAmount` on the `Earning` table. All the data in the column will be lost.
  - You are about to drop the column `platformFee` on the `Earning` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Earning` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[ownerId]` on the table `Earning` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Earning" DROP CONSTRAINT "Earning_bookingId_fkey";

-- DropIndex
DROP INDEX "Earning_bookingId_key";

-- AlterTable
ALTER TABLE "Earning" DROP COLUMN "bookingId",
DROP COLUMN "createdAt",
DROP COLUMN "grossAmount",
DROP COLUMN "netAmount",
DROP COLUMN "platformFee",
DROP COLUMN "status",
ADD COLUMN     "remainingAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "totalEarning" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Earning_ownerId_key" ON "Earning"("ownerId");
