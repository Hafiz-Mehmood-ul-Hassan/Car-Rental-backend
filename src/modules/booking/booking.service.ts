import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { calculateDays } from "./booking.utils";
import { createBookingRepo } from "./booking.repository";
import { checkAvailability } from "../availability/availability.service";
import { requestBookingReturn,completeBooking } from "./booking.lifecycle.service";

export const createBooking = async (userId: number, data: any) => {
  const { carId, startDate, endDate } = data;

  const start = new Date(startDate);
  const end = new Date(endDate);

  // 1. Validate dates
  if (start >= end) {
    throw new AppError("Invalid date range", 400);
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
    // booking created, now payment is expected from user
    status: "PAYMENT_PENDING",
  });
  await prisma.payment.create({
  data: {
    bookingId: booking.id,
    userId,
    amount: totalPrice,
    status: "PENDING",
    provider: "STRIPE",
  },
});

  return booking;
};

export const getUserBookings = async (userId: number) => {
  return prisma.booking.findMany({
    where: { userId },
    include: { car: true, payment: true },
    orderBy: { createdAt: "desc" },
  });
};

export const getOwnerBookings = async (ownerId: number) => {
  return prisma.booking.findMany({
    where: { car: { ownerId } },
    include: { car: true, user: true, payment: true, },
    orderBy: { createdAt: "desc" },
  });
};

export const requestReturn = async (
  userId: number,
  bookingId: number
) => {
  return requestBookingReturn(bookingId, userId);
};

export const acceptReturn = async (
  ownerId: number,
  bookingId: number
) => {
  return completeBooking(bookingId, ownerId);
};

// export const completeReturnByUser = async (userId: number, bookingId: number) => {
//   const booking = await prisma.booking.findUnique({
//     where: { id: bookingId },
//     include: { car: true, payment: true },
//   });

//   if (!booking) {
//     throw new AppError("Booking not found", 404);
//   }

//   if (booking.userId !== userId) {
//     throw new AppError("Unauthorized", 403);
//   }

//   if (booking.status !== "RETURN_REQUESTED") {
//     throw new AppError("Booking must be in return requested state", 400);
//   }

//   const [updatedBooking] = await prisma.$transaction([
//     prisma.booking.update({
//       where: { id: bookingId },
//       data: { status: "COMPLETED" },
//       include: { car: true, payment: true },
//     }),
//     prisma.car.update({ where: { id: booking.carId }, data: { isBooked: false } }),
//   ]);

//   return updatedBooking;
// };

