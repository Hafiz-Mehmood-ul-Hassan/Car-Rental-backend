import prisma from "../../config/prisma";
import { carUpload } from "./car.upload";
// CREATE CAR
export const createCarRepo = (data: any) => {
  return prisma.car.create({
    data,
  });
};



export const findCarById = (id: number) => {
  return prisma.car.findUnique({
    where: { id },
    include: { images: true, documents: true },
  });
}
export const getPendingCarsRepo = () => {
  return prisma.car.findMany({
    where: { status: "PENDING" },
    include: {
      owner: true,
      images: true,
      documents: true,
    },
  });
};


export const updateCarStatusRepo = (id: number, status: any) => {
  console.log("Updating car status", { id, status: status['status'] });
 // Debug log
  return prisma.car.update({
    where: { id },
    data: { status: status['status'] },
  });
};

export const getApprovedCarsRepo = async (filters: any, skip: number, take: number) => {
  const { brand, location, minPrice, maxPrice } = filters;

  return prisma.car.findMany({
    where: {
      status: "APPROVED",

      ...(brand && {
        brand: { contains: brand, mode: "insensitive" },
      }),

      ...(location && {
        location: { contains: location, mode: "insensitive" },
      }),

      ...(minPrice || maxPrice
        ? {
            pricePerDay: {
              gte: minPrice,
              lte: maxPrice,
            },
          }
        : {}),
    },

    include: {
      images: true,
    },

    skip,
    take,

    orderBy: {
      createdAt: "desc",
    },
  });
};


