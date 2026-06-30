import prisma from "../../config/prisma";
import { BookingStatus } from "@prisma/client";
import { AppError } from "../../shared/errors/AppError";
import { createEarning } from "../earning/earning.service";

export const getAllBookingsService = async () => {
  return prisma.booking.findMany({
    include: {
      user: true,
      car: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getPendingBookingsService = async () => {
  return prisma.booking.findMany({
    where: { status: "PAYMENT_PENDING" },
    include: {
      user: true,
      car: true,
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const getBookingByIdService = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user: true,
      car: true,
      payment: true,
    },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  return booking;
};

export const updateBookingStatusService = async (
  bookingId: number,
  status: string,
) => {
  const allowedStatuses = [
    "PENDING",
    "PAYMENT_PENDING",
    "CONFIRMED",
    "ACTIVE",
    "RETURN_REQUESTED",
    "COMPLETED",
    "CANCELLED",
    "EXPIRED",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new AppError("Invalid booking status", 400);
  }

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const updateData: any = { status: status as BookingStatus };

  const bookingUpdate = prisma.booking.update({
    where: { id: bookingId },
    data: updateData,
    include: {
      user: true,
      car: true,
      payment: true,
    },
  });

  if (status === "CONFIRMED") {
    const [updatedBooking] = await prisma.$transaction([
      bookingUpdate,
      prisma.car.update({ where: { id: booking.carId }, data: { isBooked: true } }),
    ]);
    return updatedBooking;
  }

if (status === "COMPLETED") {
  const [updatedBooking] = await prisma.$transaction([
    bookingUpdate,
    prisma.car.update({
      where: { id: booking.carId },
      data: { isBooked: false },
    }),
  ]);

  await createEarning(updatedBooking.id);

  return updatedBooking;
}

if (status === "CANCELLED" || status === "EXPIRED") {
  const [updatedBooking] = await prisma.$transaction([
    bookingUpdate,
    prisma.car.update({
      where: { id: booking.carId },
      data: { isBooked: false },
    }),
  ]);

  return updatedBooking;
}
};
