import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { KYCStatus } from "@prisma/client";

const PLATFORM_FEE_RATE = 0.1;

// 📊 DASHBOARD STATS
export const getDashboardStats = async () => {
  console.log(`getDashboardStats called`);
  const [
    totalUsers,
    pendingKyc,
    pendingCars,
    approvedCars,
    totalBookings,
    pendingReturnRequests,
    totalReviews,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.kYC.count({ where: { status: "PENDING" } }),
    prisma.car.count({ where: { status: "PENDING" } }),
    prisma.car.count({ where: { status: "APPROVED" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "RETURN_REQUESTED" } }),
    prisma.review.count(),
  ]);

  return {
    totalUsers,
    pendingKyc,
    pendingCars,
    approvedCars,
    totalBookings,
    pendingReturnRequests,
    totalReviews,
  };
};

// 👤 USERS
export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      kycStatus: true,
    },
  });
};

// 🧾 KYC
export const getAllKyc = async () => {
  return prisma.kYC.findMany({
    include: { user: true },
  });
};

export const updateKycStatus = async (id: number, status: string) => {
  return prisma.kYC.update({
    where: { id },
    data: { status: status as KYCStatus },
  });
};

// ========== PAYMENTS (ADMIN) ===========
export const getPendingPayments = async () => {
  return prisma.payment.findMany({
    where: { status: "PENDING" },
    include: { booking: { include: { car: true } }, user: true },
  });
};

export const approvePayment = async (paymentId: number) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) throw new AppError("Payment not found", 404);

  if (payment.status !== "PENDING") throw new AppError("Payment already processed", 400);

  const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId }, include: { car: true } });
  if (!booking) throw new AppError("Associated booking not found", 404);
  if (!booking.car) throw new AppError("Associated car not found", 404);

  const grossAmount = payment.amount;
  const platformFee = Number((grossAmount * PLATFORM_FEE_RATE).toFixed(2));
  const netAmount = Number((grossAmount - platformFee).toFixed(2));

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: "SUCCESS", paidAt: new Date() },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data: { status: "ACTIVE" },
    }),
    prisma.car.update({ where: { id: booking.carId }, data: { isBooked: true } }),
    prisma.earning.upsert({
      where: { bookingId: booking.id },
      update: {
        ownerId: booking.car.ownerId,
        grossAmount,
        platformFee,
        netAmount,
        status: "PENDING",
      },
      create: {
        ownerId: booking.car.ownerId,
        bookingId: booking.id,
        grossAmount,
        platformFee,
        netAmount,
        status: "PENDING",
      },
    }),
  ]);

  return true;
};

export const rejectPayment = async (paymentId: number) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });

  if (!payment) throw new AppError("Payment not found", 404);

  if (payment.status !== "PENDING") throw new AppError("Payment already processed", 400);

  await prisma.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });

  return true;
};

export const getPendingOwnerPayouts = async () => {
  return prisma.earning.findMany({
    where: { status: "PENDING" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      booking: { include: { car: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const markOwnerPayoutPaid = async (earningId: number) => {
  const earning = await prisma.earning.findUnique({ where: { id: earningId } });

  if (!earning) throw new AppError("Earning record not found", 404);

  if (earning.status === "AVAILABLE") throw new AppError("Payout already marked as paid", 400);

  return prisma.earning.update({
    where: { id: earningId },
    data: { status: "AVAILABLE" },
  });
};