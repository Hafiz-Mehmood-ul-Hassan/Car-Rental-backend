import { Router } from "express";
import { adminGetReviewsController, adminUpdateReviewController, adminDeleteReviewController } from "../review/review.controller";

const router = Router();

router.get("/", adminGetReviewsController);
router.patch("/:id", adminUpdateReviewController);
router.delete("/:id", adminDeleteReviewController);

export default router;
