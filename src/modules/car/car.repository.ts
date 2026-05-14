import prisma from "../../config/prisma";


// ================= CREATE =================

export const createCar = (data: any) =>
  prisma.car.create({ data });


// ================= OWNER =================

export const findCarsByOwner = (ownerId: number) =>
  prisma.car.findMany({
    where: { ownerId },
    orderBy: { createdAt: "desc" },
  });

export const updateCarByOwner = (
  ownerId: number,
  carId: number,
  data: any
) =>
  prisma.car.updateMany({
    where: {
      id: carId,
      ownerId,
    },
    data,
  });

export const deleteCarByOwner = (
  ownerId: number,
  carId: number
) =>
  prisma.car.deleteMany({
    where: {
      id: carId,
      ownerId,
    },
  });


// ================= ADMIN =================

export const findAllCars = (skip: number, take: number) =>
  prisma.car.findMany({
    skip,
    take,
    orderBy: { createdAt: "desc" },
  });

export const countCars = () =>
  prisma.car.count();

export const updateCar = (id: number, data: any) =>
  prisma.car.update({
    where: { id },
    data,
  });

export const deleteCar = (id: number) =>
  prisma.car.delete({
    where: { id },
  });


// ================= PUBLIC =================

export const findApprovedCars = () =>
  prisma.car.findMany({
    where: { status: "APPROVED" },
  });

export const findCarById = (id: number) =>
  prisma.car.findUnique({
    where: { id },
  });