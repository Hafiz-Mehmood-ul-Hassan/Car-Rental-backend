import prisma from "../../config/prisma";

export const getAllEarningsRepo = () => {
  return prisma.earning.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      booking: {
        select: {
          id: true,
          startDate: true,
          endDate: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};