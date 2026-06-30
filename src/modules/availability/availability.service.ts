import prisma from "../../config/prisma";

const BLOCKING_BOOKING_STATUSES = ["PAYMENT_PENDING", "COMPLETED", "ACTIVE", "RETURN_REQUESTED"] as const;

const findConflictingBookings = async (carId: number, start?: Date, end?: Date, excludeBookingId?: number) => {
  if (!start || !end) {
    return [];
  }

  return prisma.booking.findMany({
    where: {
      carId,
      status: { in: BLOCKING_BOOKING_STATUSES as any },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
      AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
    },
    select: { id: true, status: true, startDate: true, endDate: true },
  });
};

export const checkAvailability = async (carId: number, start?: Date, end?: Date) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car) {
    return { available: false, reason: "Car not found" };
  }

  if (car.isBooked) {
    return { available: false, reason: "Car is already booked" };
  }

  const conflictingBookings = await findConflictingBookings(carId, start, end);

  if (conflictingBookings.length > 0) {
    return { available: false, reason: "Car is already reserved for the selected dates" };
  }

  return { available: true };
};

export default { checkAvailability };
