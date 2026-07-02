// src/modules/verification/verification.type.ts

import { Role } from "@prisma/client";

export interface RegistrationPayload {
  name: string;
  password: string;
  role: Role;
}

export interface CreateRegistrationVerificationDTO {
  email: string;
  payload: RegistrationPayload;
  ipAddress?: string;
  userAgent?: string;
}