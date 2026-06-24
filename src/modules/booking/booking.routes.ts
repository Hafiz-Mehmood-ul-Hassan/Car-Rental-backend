import express from "express";
import {
  createBookingController,
  getOwnerBookingsController,
  getUserBookingsController,
  requestReturnController,
  acceptReturnController,
} from "./booking.controller";
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

router.get("/me", verifyToken, getUserBookingsController);
router.get("/owner", verifyToken, roleGuard("CAR_OWNER"), kycGuard, getOwnerBookingsController);

// router.patch("/:id/request-return", verifyToken, roleGuard("RENTER"), kycGuard, requestReturnController);
// router.patch("/:id/accept-return", verifyToken, roleGuard("CAR_OWNER"), kycGuard, acceptReturnController);


export default router;