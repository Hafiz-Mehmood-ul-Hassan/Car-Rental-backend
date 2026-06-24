import prisma from "../../config/prisma";

/**
 * Simple availability check using the `isBooked` flag on Car.
 * Signature keeps optional start/end parameters for future enhancement,
 * but currently only uses `isBooked` boolean as requested.
 */
export const checkAvailability = async (
  carId: number,
  _start?: Date,
  _end?: Date
) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });

  if (!car) {
    return { available: false, reason: "Car not found" };
  }

  if (car.isBooked) {
    return { available: false, reason: "Car is already booked" };
  }

  return { available: true };
};

export default { checkAvailability };
