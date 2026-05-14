import prisma from "../../config/prisma";
import { isOverlapping } from "./availability.utils";

export const checkAvailability = async (
  carId: number,
  startDate: Date,
  endDate: Date
) => {
  const bookings = await prisma.booking.findMany({
    where: {
      carId,
      status: {
        in: ["CONFIRMED", "ACTIVE"],
      },
    },
  });

  const conflict = bookings.find((b) =>
    isOverlapping(
      startDate,
      endDate,
      new Date(b.startDate),
      new Date(b.endDate)
    )
  );

  return {
    available: !conflict,
    conflict: conflict || null,
  };
};