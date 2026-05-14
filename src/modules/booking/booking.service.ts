import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { calculateDays } from "./booking.utils";
import { createBookingRepo } from "./booking.repository";
import { checkAvailability } from "../availability/availability.service";

export const createBooking = async (userId: number, data: any) => {
  const { carId, startDate, endDate } = data;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 1. Validate dates
  if (start >= end) {
    throw new AppError("Invalid date range", 400);
  }

  // 2. Check user + KYC
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.kycStatus !== "APPROVED") {
    throw new AppError("KYC not approved", 403);
  }

  // 3. Check car
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car || car.status !== "APPROVED") {
    throw new AppError("Car not available", 400);
  }

  // 4. ✅ AVAILABILITY MODULE USED HERE
  const availability = await checkAvailability(carId, start, end);

  if (!availability.available) {
    throw new AppError("Car not available for selected dates", 409);
  }

  // 5. Pricing engine
  const days = calculateDays(start, end);
  const totalPrice = days * car.pricePerDay;

  // 6. Create booking
  const booking = await createBookingRepo({
    userId,
    carId,
    startDate: start,
    endDate: end,
    totalPrice,
    status: "PENDING",
    paymentStatus: "PENDING",
  });

  return booking;
};