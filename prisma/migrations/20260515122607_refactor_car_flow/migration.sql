-- AlterTable
ALTER TABLE "CarDocument" ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "size" INTEGER;

-- CreateIndex
CREATE INDEX "CarDocument_carId_idx" ON "CarDocument"("carId");
