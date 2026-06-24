import { Router } from "express";
import {
  getAllCarsController,
  getPendingCarsController,
  approveCarController,
  rejectCarController,
} from "./car.admin.controller";

const router = Router();

router.get("/", getAllCarsController);
router.get("/pending", getPendingCarsController);
router.patch("/:id/approve", approveCarController);
router.patch("/:id/reject", rejectCarController);

export default router;