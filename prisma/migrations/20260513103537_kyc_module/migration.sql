/*
  Warnings:

  - Added the required column `cnicBack` to the `KYC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `cnicFront` to the `KYC` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfie` to the `KYC` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "KYC" ADD COLUMN     "cnicBack" TEXT NOT NULL,
ADD COLUMN     "cnicFront" TEXT NOT NULL,
ADD COLUMN     "selfie" TEXT NOT NULL;
