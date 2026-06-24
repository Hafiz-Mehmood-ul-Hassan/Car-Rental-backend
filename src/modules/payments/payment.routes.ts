import express from "express";
import { createPaymentController, uploadReceiptController, getUserPayments } from "./payment.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { createUpload } from "../../config/upload.factory";

const router = express.Router();

const upload = createUpload("payments");

router.post("/create", verifyToken, createPaymentController);

// User uploads receipt for a booking
router.post("/upload-receipt", verifyToken, upload.single("receipt"), uploadReceiptController);

// Get current user's payments
router.get("/me", verifyToken, getUserPayments);

export default router;
