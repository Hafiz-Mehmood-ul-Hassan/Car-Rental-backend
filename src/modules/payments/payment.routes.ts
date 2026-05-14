import express from "express";
import { createPaymentController } from "./payment.controller";
import { verifyToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/create", verifyToken, createPaymentController);

export default router;