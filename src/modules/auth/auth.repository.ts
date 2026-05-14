import { tr } from "zod/locales";
import prisma from "../../config/prisma";

export const findUserByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

export const createUser = async (data: any) => {
  return prisma.user.create({
    data,
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
      createdAt: true,
      password: true,
    },
  });
};