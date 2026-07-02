import prisma from "../../config/prisma";

export const getAllEarnings = async () => {
  // console.log("reository hit");
  return await prisma.earning.findMany({
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      remainingAmount: "desc",
    },
  });
};