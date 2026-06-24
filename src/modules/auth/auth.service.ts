import bcrypt from "bcryptjs";
import prisma from "../../config/prisma";

import crypto from "crypto";
import {
  createUser,
  deleteMeRepository,
  findUserByEmail,
  findUserById,
  updateUser,
  getUsersRepository,
  adminGetUserById,
  adminUpdateUserRepository,
  updateUserRefreshToken,
  findUserByRefreshToken,
} from "./auth.repository";
import { AppError } from "../../shared/errors/AppError";
import { generateToken, generateRefreshToken, verifyRefreshToken } from "../../shared/utils/jwt";
import { KYCStatus } from "@prisma/client";
// import { adminGetsingleUser } from "./auth.controller";

const hashToken = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

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
  if (!user.isActive) {
    throw new AppError("User is blocked", 401);
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

  const refreshToken = generateRefreshToken({
    id: user.id,
    role: user.role,
  });

  const refreshTokenHash = hashToken(refreshToken);
  const refreshTokenExp = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await updateUserRefreshToken(user.id, refreshTokenHash, refreshTokenExp);

    return {
    token,
    refreshToken,
    role: user.role,
    KYCStatus: user.kycStatus,
   }; 
  };

export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 400);
  }

  let decoded: any;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (error) {
    throw new AppError("Invalid refresh token", 401);
  }

  const refreshTokenHash = hashToken(refreshToken);
  const user = await findUserByRefreshToken(refreshTokenHash);

  if (!user || user.id !== decoded.id) {
    throw new AppError("Refresh token not recognized", 401);
  }

  if (!user.isActive) {
    throw new AppError("User is blocked", 401);
  }

  const newAccessToken = generateToken({
    id: user.id,
    role: user.role,
  });

  const newRefreshToken = generateRefreshToken({
    id: user.id,
    role: user.role,
  });

  await updateUserRefreshToken(
    user.id,
    hashToken(newRefreshToken),
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );

  return {
    token: newAccessToken,
    refreshToken: newRefreshToken,
  };
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

// =============================
// user services
// =============================

export const getMe = async (userId: number) => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const updateMeService =  async (userId: number, data: any) => {
      try {
    // only allowed fields
    const allowedFields = [
      "name",
      "phone",
      "profileImage",
    ];

    const dataToUpdate: any = {};

    // dynamic field filtering
    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        dataToUpdate[field] = data[field];
      }
    });

    // no fields sent
    if (Object.keys(dataToUpdate).length === 0) {
      throw new AppError("No valid fields provided for update", 400);
    };

    const updatedUser = await updateUser(userId, dataToUpdate);
    return updatedUser;
  } catch (error) {
    throw new AppError("Failed to update profile", 500);
  }
};


export const changePassword = async (
  userId: number,
  oldPassword: string,
  newPassword: string
) => {
  // 1. find user
  const user = await prisma.user.findUnique({ where: { id: userId } });
  
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

export const deleteMeService = async (userId: number) => {
  // business logic can go here
  return await deleteMeRepository(userId);
};

export const adminGetUserByIdservice = async (userId: number) => {
  
  const user = await adminGetUserById(userId);
   
  return user;
};

export const getUsersService = async (filters: any) => {
  return await getUsersRepository(filters);
};



export const adminUpdateUserService = async (
  id: number,
  data: any
) => {
  // allowed fields only (security layer)
  const allowedFields = ["name", "role", "isActive", "phone"];
  const filteredData: any = {};
  
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      filteredData[field] = data[field];
    }
  });
  
  if (Object.keys(filteredData).length === 0) {
    throw new Error("No valid fields provided");
  }
  let user = await findUserById(id);
  if (user?.role=="ADMIN") {
    throw new AppError("Cannot update another admin", 403);
  }
  // console.log("Admin update user data in service:", { id, data, filteredData });
  return await adminUpdateUserRepository(id, filteredData);
};