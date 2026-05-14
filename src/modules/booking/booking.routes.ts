import express from "express";
import { createBookingController } from "./booking.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import { kycGuard } from "../../middleware/kyc.middleware";
import { validateBooking } from "../../middleware/validateBooking.middleware";

const router = express.Router();

router.post(
  "/",
  validateBooking,
  verifyToken,
  roleGuard("RENTER"),
  kycGuard,
  createBookingController
);

export default router;
