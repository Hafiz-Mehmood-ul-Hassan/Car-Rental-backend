import prisma from "../../config/prisma";

import { AppError } from "../../shared/errors/AppError";

export const createEarning = async (bookingId: number) => {
  // console.log("========== CREATE EARNING START ==========");

  try {
    // console.log("Booking ID:", bookingId);

    // 1. Get booking
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        car: true,
        payment: true,
      },
    });

    console.log("Booking:", booking);

    if (!booking) {
      throw new AppError("Booking not found", 404);
    }

    if (!booking.car) {
      throw new AppError("Car not found", 404);
    }

    if (!booking.payment) {
      throw new AppError("Payment not found", 404);
    }

    // console.log("Payment Status:", booking.payment.status);

    if (booking.payment.status !== "SUCCESS") {
      throw new AppError("Payment is not completed", 400);
    }

    const ownerId = booking.car.ownerId;

    // console.log("Owner ID:", ownerId);

    const grossAmount = booking.totalPrice;
    const platformFee = grossAmount * 0.1;
    const netAmount = grossAmount - platformFee;

    console.log({
      grossAmount,
      platformFee,
      netAmount,
    });

    // 2. Find existing earning
    const earning = await prisma.earning.findUnique({
      where: { ownerId },
    });

    // console.log("Existing earning:", earning);

    // 3. Create new record
    if (!earning) {
      // console.log("No earning found. Creating...");

      const created = await prisma.earning.create({
        data: {
          ownerId,
          totalEarning: netAmount,
          paidAmount: 0,
          remainingAmount: netAmount,
        },
      });

      // console.log("Created:", created);
      // console.log("========== CREATE EARNING END ==========");

      return created;
    }

    // 4. Update existing record
    // console.log("Updating earning...");

    const updated = await prisma.earning.update({
      where: { ownerId },
      data: {
        totalEarning: {
          increment: netAmount,
        },
        remainingAmount: {
          increment: netAmount,
        },
      },
    });

    // console.log("Updated:", updated);
    // console.log("========== CREATE EARNING END ==========");

    return updated;
  } catch (error) {
    // console.error("CREATE EARNING ERROR:");
    // console.error(error);

    throw error;
  }
};