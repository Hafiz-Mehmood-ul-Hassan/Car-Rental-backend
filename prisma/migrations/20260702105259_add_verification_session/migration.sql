-- CreateEnum
CREATE TYPE "VerificationPurpose" AS ENUM ('REGISTER', 'RESET_PASSWORD', 'CHANGE_EMAIL', 'CHANGE_PASSWORD', 'DELETE_ACCOUNT');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "VerificationSession" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "purpose" "VerificationPurpose" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "lastAttemptAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationSession_tokenHash_key" ON "VerificationSession"("tokenHash");

-- CreateIndex
CREATE INDEX "VerificationSession_email_idx" ON "VerificationSession"("email");

-- CreateIndex
CREATE INDEX "VerificationSession_email_purpose_idx" ON "VerificationSession"("email", "purpose");

-- CreateIndex
CREATE INDEX "VerificationSession_status_idx" ON "VerificationSession"("status");
