import prisma from "../../config/prisma";

export const createBookingRepo = (data: any) => {
  return prisma.booking.create({ data });
};

export const getBookingForCheckout = async (
  bookingId: number,
  userId: number
) => {
  return prisma.booking.findFirst({
    where: {
      id: bookingId,
      userId,
    },

    include: {
      car: true,
    },
  });
};

export const getPaymentByBookingId = async (
  bookingId: number
) => {
  return prisma.payment.findUnique({
    where: {
      bookingId,
    },
  });
};

export const updateStripeSessionId = async (
  paymentId: number,
  stripeSessionId: string
) => {
  return prisma.payment.update({
    where: {
      id: paymentId,
    },

    data: {
      stripeSessionId,
    },
  });
};