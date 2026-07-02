// src/modules/verification/verification.service.ts

import crypto from "crypto";

import { VerificationPurpose, VerificationStatus } from "@prisma/client";

import prisma from "../../config/prisma"

import {AppError } from "../../shared/errors/AppError";

import {
  createVerificationSession,
  cancelPendingVerification,
  findByTokenHash,
  updateVerificationSession,
} from "./verification.repository";

import {
  findUserByEmail,
  createUser,
} from "../auth/auth.repository";

import { sendVerificationEmail } from "./verification.email";

import {
  CreateRegistrationVerificationDTO,
  RegistrationPayload,
} from "./verification.types";

const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const hashToken = (token: string) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

const VERIFICATION_EXPIRE_MINUTES = 15;

const getExpiry = () => {
  return new Date(
    Date.now() +
      VERIFICATION_EXPIRE_MINUTES *
        60 *
        1000
  );
};

export const createRegistrationVerification = async (
  dto: CreateRegistrationVerificationDTO
) => {
  const { email, payload, ipAddress, userAgent } = dto;

  // 1. cancel old sessions (safe cleanup)
  await cancelPendingVerification(
    email,
    VerificationPurpose.REGISTER
  );

  // 2. generate token
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = getExpiry();

  // 3. create session FIRST (important)
  const session = await createVerificationSession({
    email,
    tokenHash,
    purpose: VerificationPurpose.REGISTER,
    payload,
    expiresAt,
    ipAddress,
    userAgent,
  });

  try {
    // 4. send email AFTER DB success
    await sendVerificationEmail(email, token);
  } catch (error) {
    // rollback safety (optional but important)
    await updateVerificationSession(session.id, {
      status: VerificationStatus.CANCELLED,
    });

    throw new AppError(
      "Failed to send verification email",
      500
    );
  }

  return {
    message: "Verification email sent successfully",
  };
};


const completeRegistration = async (
  session: any
) => {
  const payload = session.payload as any;

  // 1. safety check
  const existingUser = await findUserByEmail(session.email);

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  // 2. create user
  const user = await createUser({
    name: payload.name,
    email: session.email,
    password: payload.passwordHash,
    role: payload.role,
    isVerified: true,
    kycStatus: "NOT_SUBMITTED",
  });

  // 3. mark session verified
  await updateVerificationSession(session.id, {
    status: VerificationStatus.VERIFIED,
    verifiedAt: new Date(),
  });

  return {
    message: "Email verified successfully",
    user,
  };
};


export const verifySession = async (
  token: string,
  data?: any
) => {
  const tokenHash = hashToken(token);

  const session = await findByTokenHash(tokenHash);

  if (!session) {
    throw new AppError("Invalid verification link", 400);
  }

  if (session.status !== VerificationStatus.PENDING) {
    throw new AppError(
      "Verification session is no longer valid",
      400
    );
  }

  if (session.expiresAt < new Date()) {
    await updateVerificationSession(session.id, {
      status: VerificationStatus.EXPIRED,
    });

    throw new AppError(
      "Verification link has expired",
      400
    );
  }

  switch (session.purpose) {
    case VerificationPurpose.REGISTER:
      return await completeRegistration(session);

    case VerificationPurpose.RESET_PASSWORD:
      throw new AppError(
        "Reset password verification not implemented",
        501
      );

    case VerificationPurpose.CHANGE_EMAIL:
      throw new AppError(
        "Change email verification not implemented",
        501
      );

    case VerificationPurpose.CHANGE_PASSWORD:
      throw new AppError(
        "Change password verification not implemented",
        501
      );

    case VerificationPurpose.DELETE_ACCOUNT:
      throw new AppError(
        "Delete account verification not implemented",
        501
      );

    default:
      throw new AppError(
        "Unsupported verification purpose",
        400
      );
  }
};


