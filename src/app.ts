import express from "express";
import authRoutes from "./modules/auth/auth.routes";
import { errorHandler } from "./middleware/error.middleware";
import kycRoutes from "./modules/kyc/kyc.routes";
import cors from "cors";
import carRoutes from "./modules/car/car.routes";
import adminRoutes from "./modules/admin/admin.routes";
import bookingRoutes from "./modules/booking/booking.routes";
import paymentRoutes from "./modules/payments/payment.routes";
import reviewRoutes from "./modules/review/review.routes";
import payoutRoutes from "./modules/payout/payout.routes";
import earningRoutes from "./modules/earning/earning.routes";
import path from "path/win32";
import { stripeWebhookController } from "./modules/payments/payment.controller";
// import { adminJS } from "./modules/admin/admin";
// import AdminJSExpress from "@adminjs/express";
import verificationRoutes from "./modules/verification/verification.routes";


const app = express();


app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));


app.post(
  ["/api/payments/stripe/webhook", "/api/payments/webhook", "/payments/webhook"],
  express.raw({ type: "application/json" }),
  stripeWebhookController
);

app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "../uploads"))
);
// Admin router
// const adminRouter = AdminJSExpress.buildRouter(adminJS);

// app.use(adminJS.options.rootPath, adminRouter);

app.use('/admin', adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/verification", verificationRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/payouts", payoutRoutes);
app.use("/api/earnings", earningRoutes);


app.use(errorHandler);
export default app;