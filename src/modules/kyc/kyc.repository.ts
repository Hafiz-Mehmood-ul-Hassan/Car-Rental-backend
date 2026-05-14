import prisma from "../../config/prisma";

export const createKyc = (data: any) => prisma.kYC.create({ data });

export const findKycByUserId = (userId: number) =>
  prisma.kYC.findUnique({ where: { userId } });

export const findKycById = (id: number) =>
  prisma.kYC.findUnique({ where: { id } });

export const findAllKyc = () =>
  prisma.kYC.findMany({ include: { user: true } });

export const updateKyc = (id: number, data: any) =>
  prisma.kYC.update({ where: { id }, data });