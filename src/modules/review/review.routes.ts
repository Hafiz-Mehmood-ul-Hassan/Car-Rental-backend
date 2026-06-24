import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import {
  createReviewController,
  getCarReviewsController,
  getUserReviewsController,
} from "./review.controller";

const router = Router();

// Public: get visible reviews for a car
router.get("/car/:carId", getCarReviewsController);

// Protected: create review, get user's reviews
router.post("/", verifyToken, createReviewController);
router.get("/me", verifyToken, getUserReviewsController);

export default router;
