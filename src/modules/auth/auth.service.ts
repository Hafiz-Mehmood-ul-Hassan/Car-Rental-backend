import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";

import crypto from "crypto";
import { createUser, findUserByEmail, findUserById } from "./auth.repository";
import { AppError } from "../../shared/errors/AppError";
import { generateToken } from "../../shared/utils/jwt";

export const registerUser = async (data: any) => {
  const { name, email, password, role } = data;

  const existingUser = await findUserByEmail(email);

  if (existingUser) {
    throw new AppError("Email already registered", 400);
  }

  if (role === "ADMIN") {
    throw new AppError("Admin cannot register", 403);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await createUser({
    name,
    email,
    password: hashedPassword,
    role,
    isVerified: false,
    kycStatus: "NOT_SUBMITTED",
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async (data: any) => {
  const { email, password } = data;

  // 1. find user
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // 2. check password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  // 3. create token
  const token = generateToken({
    id: user.id,
    role: user.role,
  });

    return {
    token,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified 
  };
};


export const getMe = async (userId: number) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

// 1. FORGOT PASSWORD
export const forgotPassword = async (email: string) => {
  const user = await findUserByEmail(email);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  // generate token
  const resetToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // save hashed token in DB
  await prisma.user.update({
    where: { email },
    data: {
      resetToken: hashedToken,
      resetTokenExp: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    },
  });

  // normally send email here (for now return token)
  return {
    message: "Reset token generated",
    resetToken, // send via email in real system
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExp: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    throw new AppError("Invalid or expired token", 400);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExp: null,
    },
  });

  return {
    message: "Password reset successful",
  };
};


export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  // 1. find user
  const user = await findUserById(userId);
  
  if (!user) {
    throw new AppError("User not found", 404);
  }  
  // 2. verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  
  if (!isMatch) {
    throw new AppError("Old password is incorrect", 400);
  }
  
  // 3. hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // 4. update password
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  return null;
};