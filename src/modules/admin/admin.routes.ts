import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import {
  getDashboardStats,
  getPendingPayments,
  approvePayment,
  rejectPayment,
  getPendingOwnerPayouts,
  markOwnerPayoutPaid,
} from "./admin.controller";
import kycAdminRoutes from "../kyc/kyc.admin.routes";
import carAdminRoutes from "../car/car.admin.routes";
import bookingAdminRoutes from "../booking/booking.admin.routes";
import authAdminRoutes from "../auth/auth.admin.routes";
import reviewAdminRoutes from "./review.admin.routes";

const router = Router();

// 🔐 ALL ADMIN ROUTES PROTECTED
router.use(verifyToken, roleGuard("ADMIN"));

// 📊 Dashboard
router.get("/dashboard", getDashboardStats);

// 👤 Users
router.use("/users", authAdminRoutes);

// 🧾 KYC (module-specific admin routes)
router.use("/kyc", kycAdminRoutes);

// 🚗 Cars
router.use("/cars", carAdminRoutes);

// � Bookings
router.use("/bookings", bookingAdminRoutes);

// 📝 Reviews
router.use("/reviews", reviewAdminRoutes);

// �💳 Payments
router.get("/payments/pending", getPendingPayments);
router.patch("/payments/:id/approve", approvePayment);
router.patch("/payments/:id/reject", rejectPayment);
router.get("/payouts/pending", getPendingOwnerPayouts);
router.patch("/payouts/:id/mark-paid", markOwnerPayoutPaid);

export default router;