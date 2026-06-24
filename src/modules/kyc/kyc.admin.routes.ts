import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import {
  getAllKycController,
  getKycByIdController,
  updateKycStatusController,
  getPendingKycController,
} from "./kyc.controller";

const router = express.Router();

// All routes protected and require ADMIN role
router.use(verifyToken, roleGuard("ADMIN"));

router.get("/", getAllKycController);
router.get("/pending", getPendingKycController);
router.get("/:id", getKycByIdController);
router.patch("/:id/status", updateKycStatusController);

export default router;
