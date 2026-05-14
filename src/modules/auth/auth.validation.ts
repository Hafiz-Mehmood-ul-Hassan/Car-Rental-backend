import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name is too short"),

  email: z.string().email("Invalid email"),

  password: z.string().min(6, "Password must be at least 6 characters"),

  role: z.enum(["CAR_OWNER", "RENTER"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(6),
});