"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectPayment = exports.approvePayment = exports.getPendingPayments = exports.updateKycStatus = exports.getAllKyc = exports.getAllUsers = exports.getDashboardStats = void 0;
const prisma_1 = __importDefault(require("../../config/prisma"));
const AppError_1 = require("../../shared/errors/AppError");
const PLATFORM_FEE_RATE = 0.1;
// 📊 DASHBOARD STATS
const getDashboardStats = async () => {
    const [totalUsers, pendingKyc, pendingCars, approvedCars, totalBookings,] = await Promise.all([
        prisma_1.default.user.count(),
        prisma_1.default.kYC.count({ where: { status: "PENDING" } }),
        prisma_1.default.car.count({ where: { status: "PENDING" } }),
        prisma_1.default.car.count({ where: { status: "APPROVED" } }),
        prisma_1.default.booking.count(),
    ]);
    return {
        totalUsers,
        pendingKyc,
        pendingCars,
        approvedCars,
        totalBookings,
    };
};
exports.getDashboardStats = getDashboardStats;
// 👤 USERS
const getAllUsers = async () => {
    return prisma_1.default.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            kycStatus: true,
        },
    });
};
exports.getAllUsers = getAllUsers;
// 🧾 KYC
const getAllKyc = async () => {
    return prisma_1.default.kYC.findMany({
        include: { user: true },
    });
};
exports.getAllKyc = getAllKyc;
const updateKycStatus = async (id, status) => {
    return prisma_1.default.kYC.update({
        where: { id },
        data: { status: status },
    });
};
exports.updateKycStatus = updateKycStatus;
// ========== PAYMENTS (ADMIN) ===========
const getPendingPayments = async () => {
    return prisma_1.default.payment.findMany({
        where: { status: "PENDING" },
        include: { booking: { include: { car: true } }, user: true },
    });
};
exports.getPendingPayments = getPendingPayments;
const approvePayment = async (paymentId) => {
    const payment = await prisma_1.default.payment.findUnique({ where: { id: paymentId } });
    if (!payment)
        throw new AppError_1.AppError("Payment not found", 404);
    if (payment.status !== "PENDING")
        throw new AppError_1.AppError("Payment already processed", 400);
    const booking = await prisma_1.default.booking.findUnique({ where: { id: payment.bookingId }, include: { car: true } });
    if (!booking)
        throw new AppError_1.AppError("Associated booking not found", 404);
    if (!booking.car)
        throw new AppError_1.AppError("Associated car not found", 404);
    const grossAmount = payment.amount;
    const platformFee = Number((grossAmount * PLATFORM_FEE_RATE).toFixed(2));
    const netAmount = Number((grossAmount - platformFee).toFixed(2));
    await prisma_1.default.$transaction([
        prisma_1.default.payment.update({
            where: { id: paymentId },
            data: { status: "SUCCESS", paidAt: new Date() },
        }),
        prisma_1.default.booking.update({
            where: { id: booking.id },
            data: { status: "CONFIRMED" },
        }),
        prisma_1.default.car.update({ where: { id: booking.carId }, data: { isBooked: true } }),
        prisma_1.default.earning.upsert({
            where: { bookingId: booking.id },
            update: {
                ownerId: booking.car.ownerId,
                grossAmount,
                platformFee,
                netAmount,
                status: "AVAILABLE",
            },
            create: {
                ownerId: booking.car.ownerId,
                bookingId: booking.id,
                grossAmount,
                platformFee,
                netAmount,
                status: "AVAILABLE",
            },
        }),
    ]);
    return true;
};
exports.approvePayment = approvePayment;
const rejectPayment = async (paymentId) => {
    const payment = await prisma_1.default.payment.findUnique({ where: { id: paymentId } });
    if (!payment)
        throw new AppError_1.AppError("Payment not found", 404);
    if (payment.status !== "PENDING")
        throw new AppError_1.AppError("Payment already processed", 400);
    await prisma_1.default.payment.update({ where: { id: paymentId }, data: { status: "FAILED" } });
    return true;
};
exports.rejectPayment = rejectPayment;
