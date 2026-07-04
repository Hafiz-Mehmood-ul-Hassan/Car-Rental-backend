import prisma from "../../config/prisma";
import {
  Prisma,
  User,
  Role,
} from "@prisma/client";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (
  data: Prisma.UserCreateInput
) => {
  return prisma.user.create({
    data: {
      ...data,
      isVerified: true, // optional safety default
    },
  });
};


export const findUserById = async (id: number) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      kycStatus: true,
      createdAt: false,
      password: false, // Exclude password from the result
    },
  });
};

export const updateUser = async (id: number, data: any) => {
  return prisma.user.update({
    where: { id },
    data,
  });
};

export const updateUserRefreshToken = async (
  id: number,
  refreshTokenHash: string | null,
  refreshTokenExp: Date | null
) => {
  return prisma.user.update({
    where: { id },
    data: {
      refreshTokenHash,
      refreshTokenExp,
    },
  });
};

export const findUserByRefreshToken = async (refreshTokenHash: string) => {
  return prisma.user.findFirst({
    where: {
      refreshTokenHash,
      refreshTokenExp: {
        gte: new Date(),
      },
    },
  });
};
export const deleteMeRepository = async (userId: number) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      isActive: true,
    },
  });
};

export const adminGetUserById = async (id: number) => {
  // console.log("Admin fetching user with ID:", id);
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      kycStatus: true,
      createdAt: true,
    },

  });
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};



export const getUsersRepository = async (filters: any) => {
  const { search, role, isActive } = filters;

  const where: any = {};

  // 🔍 search by name or email
  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // 🎭 filter by role
  if (role) {
    where.role = role;
  }

  // 🔘 filter by active status
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  return await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const adminUpdateUserRepository = async (
  id: number,
  data: any
) => {
  console.log("Admin update user data in repository:", { id, data });
  let updatedUser = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      kycStatus: true,
      createdAt: true,
    },
  });
  return updatedUser;
};