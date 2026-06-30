import prisma from "./prisma";

const CLEANUP_INTERVAL_MS = 60 * 1000; // run every minute
const STALE_MS = 30 * 60 * 1000; // 30 minutes

export const startBookingCleanupJob = () => {
  const job = async () => {
    try {
      const cutoff = new Date(Date.now() - STALE_MS);
      const staleBookings = await prisma.booking.findMany({
        where: {
          status: "PAYMENT_PENDING",
          createdAt: { lt: cutoff },
        },
        include: { car: true, payment: true },
      });

      if (staleBookings.length === 0) {
        return;
      }

      for (const booking of staleBookings) {
        await prisma.$transaction(async (tx) => {
          await tx.payment.deleteMany({ where: { bookingId: booking.id } });
          await tx.booking.delete({ where: { id: booking.id } });
          if (booking.car) {
            await tx.car.update({ where: { id: booking.car.id }, data: { isBooked: false } });
          }
        });
      }

      console.log(`Booking cleanup: deleted ${staleBookings.length} stale PAYMENT_PENDING bookings`);
    } catch (err) {
      console.error("Error during booking cleanup job:", err);
    }
  };

  job();
  const interval = setInterval(job, CLEANUP_INTERVAL_MS);

  return () => clearInterval(interval);
};

export default startBookingCleanupJob;
