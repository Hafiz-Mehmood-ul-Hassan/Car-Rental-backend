import prisma from "../../config/prisma";

export const createPayoutRepo = (data: any, tx = prisma) => {
  return tx.payout.create({
    data,
  });
};

export const findEarningByIdRepo = (earningId: number, tx = prisma) => {
  return tx.earning.findUnique({
    where: { id: earningId },
    include: {
      owner: true,
      booking: true,
    },
  });
};

export const updateEarningRepo = (
  earningId: number,
  data: any,
  tx = prisma
) => {
  return tx.earning.update({
    where: { id: earningId },
    data,
  });
};