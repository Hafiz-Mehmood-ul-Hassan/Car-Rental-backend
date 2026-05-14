import prisma from "../../config/prisma";

export const createBookingRepo = (data: any) => {
  return prisma.booking.create({ data });
};