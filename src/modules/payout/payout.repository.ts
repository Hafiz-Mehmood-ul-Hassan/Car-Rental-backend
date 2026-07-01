// payout.repository.ts

import prisma from "../../config/prisma";

export const createPayout = (data: any) => {
  return prisma.payout.create({
    data,
  });
};

export const getOwnerEarning = (ownerId: number) => {
  return prisma.earning.findUnique({
    where: {
      ownerId,
    },
  });
};

export const updateOwnerEarning = (
  ownerId: number,
  amount: number
) => {
  return prisma.earning.update({
    where: {
      ownerId,
    },
    data: {
      paidAmount: {
        increment: amount,
      },
      remainingAmount: {
        decrement: amount,
      },
    },
  });
};