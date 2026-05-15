/*
  Warnings:

  - You are about to drop the column `images` on the `Car` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CarDocumentType" AS ENUM ('REGISTRATION', 'INSURANCE', 'LICENSE_PLATE', 'OTHER');

-- CreateEnum
CREATE TYPE "CarDocumentStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "BookingStatus" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "BookingStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "BookingStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CarStatus" ADD VALUE 'DRAFT';
ALTER TYPE "CarStatus" ADD VALUE 'SUSPENDED';

-- AlterTable
ALTER TABLE "Car" DROP COLUMN "images";

-- CreateTable
CREATE TABLE "CarImage" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CarImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarDocument" (
    "id" SERIAL NOT NULL,
    "carId" INTEGER NOT NULL,
    "type" "CarDocumentType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "CarDocumentStatus" NOT NULL DEFAULT 'PENDING',
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CarImage" ADD CONSTRAINT "CarImage_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CarDocument" ADD CONSTRAINT "CarDocument_carId_fkey" FOREIGN KEY ("carId") REFERENCES "Car"("id") ON DELETE CASCADE ON UPDATE CASCADE;
