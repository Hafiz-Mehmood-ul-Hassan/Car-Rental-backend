import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { createEarning } from "../earning/earning.service";

export const activateBooking = async (
  bookingId: number,
  tx = prisma
) => {
  const booking = await tx.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "PAYMENT_PENDING") {
    throw new AppError("Booking cannot be activated", 400);
  }

  await tx.booking.update({
    where: { id: bookingId },
    data: {
      status: "ACTIVE",
    },
  });

  await tx.car.update({
    where: {
      id: booking.carId,
    },
    data: {
      isBooked: true,
    },
  });
  await createEarning(booking.id);
};
export const requestBookingReturn = async (
  bookingId: number,
  userId: number
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (booking.status !== "ACTIVE") {
    throw new AppError("Only active bookings can request return", 400);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "RETURN_REQUESTED",
    },
  });
};

export const completeBooking = async (
  bookingId: number,
  ownerId: number
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      car: true,
    },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.car.ownerId !== ownerId) {
    throw new AppError("Unauthorized", 403);
  }

  if (booking.status !== "RETURN_REQUESTED") {
    throw new AppError("Booking is not waiting for return approval", 400);
  }

  return prisma.$transaction([
    prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "COMPLETED",
      },
    }),

    prisma.car.update({
      where: { id: booking.carId },
      data: {
        isBooked: false,
      },
    }),
  ]);
};

export const cancelBooking = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (
    booking.status === "COMPLETED" ||
    booking.status === "CANCELLED"
  ) {
    throw new AppError("Booking cannot be cancelled", 400);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "CANCELLED",
    },
  });
};

export const expireBooking = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.status !== "PAYMENT_PENDING") {
    throw new AppError("Booking cannot be expired", 400);
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: "EXPIRED",
    },
  });
};