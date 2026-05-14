import prisma from "../../config/prisma";
import { stripe } from "./stripe";
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

  if (booking.status !== "PENDING") {
    throw new AppError("Payment already processed", 400);
  }

  // 1. Create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `Car Rental - ${booking.car.title}`,
          },
          unit_amount: Math.round(booking.totalPrice * 100),
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/payment-success`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-failed`,
    metadata: {
      bookingId: booking.id.toString(),
    },
  });

  // 2. Save payment record
  await prisma.payment.create({
    data: {
      bookingId: booking.id,
      userId,
      amount: booking.totalPrice,
      stripeSessionId: session.id,
      status: "PENDING",
    },
  });

  return session.url;
};