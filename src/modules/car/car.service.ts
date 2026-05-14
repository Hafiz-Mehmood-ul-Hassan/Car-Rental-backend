import * as repo from "./car.repository";
import { AppError } from "../../shared/errors/AppError";


// ================= OWNER =================

export const createCarService = async (
  ownerId: number,
  payload: any,
  images: string[]
) => {
    await   repo.createCar({
    ...payload,
    ownerId,
    images,

    year: Number(payload.year),
    pricePerDay: Number(payload.pricePerDay),
    status: "PENDING",
  });
  return true;
};

export const getOwnerCarsService = (ownerId: number) => {
  return repo.findCarsByOwner(ownerId);
};

export const updateOwnCarService = async (
  ownerId: number,
  carId: number,
  data: any
) => {
  const car = await repo.findCarById(carId);

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  if (car.ownerId !== ownerId) {
    throw new AppError("Not allowed to modify this car", 403);
  }

  return repo.updateCar(carId, data);
};

export const deleteOwnCarService = async (
  ownerId: number,
  carId: number
) => {
  const car = await repo.findCarById(carId);

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  if (car.ownerId !== ownerId) {
    throw new AppError("Not allowed to modify this car", 403);
  }

  return repo.deleteCar(carId);
};


// ================= ADMIN =================

export const getAllCarsAdminService = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    repo.findAllCars(skip, limit),
    repo.countCars(),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateCarStatusService = (
  id: number,
  status: string,
  reviewNote?: string
) => {
  return repo.updateCar(id, { status, reviewNote });
};

export const deleteCarAdminService = (id: number) => {
  return repo.deleteCar(id);
};


// ================= PUBLIC =================

export const getApprovedCarsService = () => {
  return repo.findApprovedCars();
};

export const getCarByIdService = (id: number) => {
  return repo.findCarById(id);
};