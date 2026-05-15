import { AppError } from "../../shared/errors/AppError";
import {
  getPendingCarsRepo,
  updateCarStatusRepo,
} from "./car.repository";
import prisma from "../../config/prisma";

export const getPendingCarsService = async () => {
  return await getPendingCarsRepo();
};

export const approveCarService = async (carId: number) => {
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  if (car.status !== "PENDING") {
    throw new AppError("Only pending cars can be approved", 400);
  }

  return await updateCarStatusRepo(carId, {
    status: "APPROVED",
    reviewNote: null,
  });
};

export const rejectCarService = async (
  carId: number,
  note: string
) => {
  const car = await prisma.car.findUnique({
    where: { id: carId },
  });

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  if (car.status !== "PENDING") {
    throw new AppError("Only pending cars can be rejected", 400);
  }

  return await updateCarStatusRepo(carId, {
    status: "REJECTED",
    reviewNote: note,
  });
};