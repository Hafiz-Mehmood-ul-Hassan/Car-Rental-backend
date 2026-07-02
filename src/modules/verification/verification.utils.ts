// src/modules/verification/verification.utils.ts

import crypto from "crypto";

const TOKEN_EXPIRES_IN_MINUTES = 15;

/**
 * Generates a cryptographically secure random token
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

/**
 * Hashes the verification token before storing it
 */
export const hashVerificationToken = (
  token: string
): string => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

/**
 * Returns the token expiry time
 */
export const getVerificationExpiry = (): Date => {
  return new Date(
    Date.now() + TOKEN_EXPIRES_IN_MINUTES * 60 * 1000
  );
};