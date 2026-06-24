import app from "./app";
import dotenv from "dotenv";
import startBookingCleanupJob from "./config/scheduler";

dotenv.config();

const PORT = process.env.PORT || 5000;
// start background jobs
startBookingCleanupJob();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});