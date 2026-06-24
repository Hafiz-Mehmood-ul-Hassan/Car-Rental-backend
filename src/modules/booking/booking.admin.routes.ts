import { Router } from "express";
import {
  getAllBookingsController,
  getPendingBookingsController,
  getBookingByIdController,
  updateBookingStatusController,
} from "./booking.admin.controller";

const router = Router();

router.get("/", getAllBookingsController);
router.get("/pending", getPendingBookingsController);
router.get("/:id", getBookingByIdController);
router.patch("/:id/status", updateBookingStatusController);

export default router;
