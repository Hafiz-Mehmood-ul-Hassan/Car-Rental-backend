import prisma from "./prisma";

const CLEANUP_INTERVAL_MS = 60 * 1000; // run every minute
const STALE_MS = 30 * 60 * 1000; // 30 minutes

export const startBookingCleanupJob = () => {
  const job = async () => {
    try {
      const cutoff = new Date(Date.now() - STALE_MS);
      const result = await prisma.booking.deleteMany({
        where: {
          status: "PAYMENT_PENDING",
          createdAt: { lt: cutoff },
        },
      });

      if (result.count && result.count > 0) {
        console.log(`Booking cleanup: deleted ${result.count} stale PAYMENT_PENDING bookings`);
      }
    } catch (err) {
      console.error("Error during booking cleanup job:", err);
    }
  };

  // run immediately and then on interval
  job();
  const interval = setInterval(job, CLEANUP_INTERVAL_MS);

  return () => clearInterval(interval);
};

export default startBookingCleanupJob;
