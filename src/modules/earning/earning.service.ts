import prisma from "../../config/prisma";
import { getAllEarningsRepo } from "./earning.repository";

export const getAllEarnings = async () => {
  return await getAllEarningsRepo();
};
export const createEarning = async (bookingId: number) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: bookingId,
    },
    include: {
      car: true,
      payment: true,
    },
  });

  if (!booking || !booking.payment || !booking.car) {
    throw new Error("Booking data not found");
  }

  // Don't create twice
  const existing = await prisma.earning.findUnique({
    where: {
      bookingId,
    },
  });

  if (existing) {
    return existing;
  }

  const grossAmount = booking.totalPrice;

  // 10% platform fee
  const platformFee = grossAmount * 0.10;

  const netAmount = grossAmount - platformFee;

  return prisma.earning.create({
    data: {
      ownerId: booking.car.ownerId,
      bookingId,

      grossAmount,
      platformFee,
      netAmount,

      paidAmount: 0,
      status: "AVAILABLE",
    },
  });
};