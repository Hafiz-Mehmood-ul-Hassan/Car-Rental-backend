import type Stripe from "stripe";
import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import { stripe } from "./stripe";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

export const createPaymentSession = async (bookingId: number, userId: number) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { car: true, user: true },
  });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  if (booking.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  if (booking.status !== "PAYMENT_PENDING" && booking.status !== "CONFIRMED") {
    throw new AppError("Booking is not awaiting payment", 400);
  }

  if (!stripe) {
    throw new AppError("Stripe is not configured", 500);
  }

  const existing = await prisma.payment.findUnique({ where: { bookingId } });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: booking.user.email,
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(booking.totalPrice * 100),
          product_data: {
            name: `${booking.car.title} rental`,
            description: `${booking.car.brand} ${booking.car.model}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${FRONTEND_URL}/payment/cancel?bookingId=${booking.id}`,
    metadata: {
      bookingId: booking.id.toString(),
      userId: userId.toString(),
    },
  });

  const payment = await prisma.payment.upsert({
    where: { bookingId },
    update: {
      amount: booking.totalPrice,
      provider: "STRIPE",
      status: "PENDING",
      stripeSessionId: session.id,
      userId,
    },
    create: {
      bookingId: booking.id,
      userId,
      amount: booking.totalPrice,
      provider: "STRIPE",
      status: "PENDING",
      stripeSessionId: session.id,
    },
  });

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "PAYMENT_PENDING" },
  });

  return {
    message: "Stripe checkout session created",
    url: session.url,
    sessionId: session.id,
    paymentId: payment.id,
    bookingId: booking.id,
  };
};

const finalizeSuccessfulPayment = async (session: Stripe.Checkout.Session, payment: any) => {
  if (payment.status === "SUCCESS") {
    return { message: "Payment already completed", bookingId: payment.bookingId };
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return {
      message: "Payment is not completed yet",
      bookingId: payment.bookingId,
      paymentStatus: session.payment_status,
      sessionStatus: session.status,
    };
  }

  const booking = await prisma.booking.findUnique({ where: { id: payment.bookingId } });

  if (!booking) {
    throw new AppError("Booking not found", 404);
  }

  const conflictingBookings = await prisma.booking.findMany({
    where: {
      carId: booking.carId,
      id: { not: booking.id },
      status: { in: ["PAYMENT_PENDING", "CONFIRMED", "ACTIVE", "RETURN_REQUESTED"] },
      AND: [{ startDate: { lt: booking.endDate } }, { endDate: { gt: booking.startDate } }],
    },
    select: { id: true, status: true },
  });

  if (conflictingBookings.length > 0) {
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      }),
      prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: "CANCELLED" },
      }),
    ]);

    return {
      message: "Booking was cancelled because the car already had an overlapping reservation",
      bookingId: payment.bookingId,
      cancelled: true,
    };
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: "SUCCESS",
        paidAt: new Date(),
        transactionId: session.payment_intent?.toString(),
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: "ACTIVE" },
    }),
    prisma.car.update({
      where: { id: booking.carId },
      data: { isBooked: true },
    }),
  ]);

  return { message: "Payment completed successfully", bookingId: payment.bookingId };
};

export const handleStripeCheckoutSuccess = async (sessionId: string) => {
  if (!stripe) {
    throw new AppError("Stripe is not configured", 500);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const payment = await prisma.payment.findFirst({
    where: { stripeSessionId: session.id },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  return finalizeSuccessfulPayment(session, payment);
};

export const verifyStripeSession = async (sessionId: string, userId: number) => {
  if (!stripe) {
    throw new AppError("Stripe is not configured", 500);
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  const payment = await prisma.payment.findFirst({
    where: { stripeSessionId: session.id },
  });

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.userId !== userId) {
    throw new AppError("Unauthorized", 403);
  }

  return finalizeSuccessfulPayment(session, payment);
};

export const uploadPaymentReceipt = async (bookingId: number, userId: number, file: any) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) throw new AppError("Booking not found", 404);

  if (booking.userId !== userId) throw new AppError("Unauthorized", 403);

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