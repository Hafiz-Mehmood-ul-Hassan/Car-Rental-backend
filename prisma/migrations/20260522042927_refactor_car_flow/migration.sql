-- AlterTable
ALTER TABLE "Car" ADD COLUMN     "isBooked" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "receiptUrl" TEXT;
