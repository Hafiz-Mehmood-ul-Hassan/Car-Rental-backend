// src/modules/verification/verification.repository.ts

import prisma from "../../config/prisma";
import {
  VerificationPurpose,
  VerificationStatus,
} from "@prisma/client";

export const createVerificationSession = (data: {
  email: string;
  tokenHash: string;
  purpose: VerificationPurpose;
  payload: object;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}) => {
  return prisma.verificationSession.create({
    data,
  });
};

export const findPendingVerification = (
  email: string,
  purpose: VerificationPurpose
) => {
  return prisma.verificationSession.findFirst({
    where: {
      email,
      purpose,
      status: VerificationStatus.PENDING,
    },
  });
};

export const cancelPendingVerification = (
  email: string,
  purpose: VerificationPurpose
) => {
  return prisma.verificationSession.updateMany({
    where: {
      email,
      purpose,
      status: VerificationStatus.PENDING,
    },
    data: {
      status: VerificationStatus.CANCELLED,
    },
  });
};

export const findByTokenHash = (
  tokenHash: string
) => {
  return prisma.verificationSession.findUnique({
    where: {
      tokenHash,
    },
  });
};

export const updateVerificationSession = (
  id: number,
  data: {
    status?: VerificationStatus;
    verifiedAt?: Date;
    lastAttemptAt?: Date;
    attempts?: {
      increment: number;
    };
  }
) => {
  return prisma.verificationSession.update({
    where: {
      id,
    },
    data,
  });
};

export const deleteExpiredVerificationSessions = () => {
  return prisma.verificationSession.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};