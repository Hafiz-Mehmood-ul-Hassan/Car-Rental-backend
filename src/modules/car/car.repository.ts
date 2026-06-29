import prisma from "../../config/prisma";
import { carUpload } from "./car.upload";
// CREATE CAR
export const createCarRepo = (data: any) => {
  return prisma.car.create({
    data,
  });
};

export const findCarByOwnerId = (ownerId: number) => {
  return prisma.car.findMany({
    where: { ownerId },
    include: {
      images: true,
      documents: true,
      bookings: {
        include: { user: true, payment: true },
        orderBy: { createdAt: "desc" },
      },
    },
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
  // status can be a string like "PENDING" or an object { status: "APPROVED", reviewNote: null }
  if (typeof status === "string") {
    return prisma.car.update({ where: { id }, data: { status: status as any } });
  }

  // assume object
  const data: any = {};

  if (status.status) data.status = status.status;
  if (status.reviewNote !== undefined) data.reviewNote = status.reviewNote;

  return prisma.car.update({ where: { id }, data });
};

export const updateCarAvailabilityRepo = (id: number, isBooked: boolean) => {
  return prisma.car.update({ where: { id }, data: { isBooked } });
};

export const getApprovedCarsRepo = async (filters: any, skip: number, take: number) => {
  const { brand, location, minPrice, maxPrice } = filters;

  return prisma.car.findMany({
    where: {
      status: "APPROVED",
      isBooked: false,

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


