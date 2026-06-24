import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

export const createPaymentSession = async (bookingId: number, userId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  // Allow creating a payment record when booking is awaiting payment
  // (some flows set status to PAYMENT_PENDING at booking creation).
  if (booking.status === "CONFIRMED" || booking.status === "ACTIVE" || booking.status === "COMPLETED") {
    throw new AppError("Payment already processed", 400);
  }
  // Create a manual payment record and instruct user to upload receipt
  const existing = await prisma.payment.findUnique({ where: { bookingId } });

  const data: any = {
    bookingId: booking.id,
    userId,
    amount: booking.totalPrice,
    provider: "MANUAL",
    status: "PENDING",
  };

  if (!existing) {
    await prisma.payment.create({ data });
  } else {
    await prisma.payment.update({ where: { id: existing.id }, data });
  }

  // Ensure booking is in PAYMENT_PENDING state
  await prisma.booking.update({ where: { id: booking.id }, data: { status: "PAYMENT_PENDING" } });

  return { message: "Payment record created. Upload receipt using /api/payments/upload-receipt." };
};

export const uploadPaymentReceipt = async (bookingId: number, userId: number, file: Express.Multer.File) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new AppError("Booking not found", 404);

  if (booking.userId !== userId) throw new AppError("Unauthorized", 403);

  // create or update payment record for this booking
  const existing = await prisma.payment.findUnique({ where: { bookingId } });

  const data: any = {
    bookingId,
    userId,
    amount: booking.totalPrice,
    provider: "MANUAL",
    receiptUrl: file.path,
    status: "PENDING",
  };

  if (existing) {
    return prisma.payment.update({ where: { id: existing.id }, data });
  }

  return prisma.payment.create({ data });
};

export const getUserPayments = async (userId: number) => {
  return prisma.payment.findMany({
    where: { userId },
    include: { booking: { include: { car: true } } },
    orderBy: { createdAt: "desc" },
  });
};