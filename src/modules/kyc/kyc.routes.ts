import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { upload } from "../../config/upload";
import { kycSchema } from "./kyc.validation";

import {
  submitKycController,
  getMyKycController,
  getAllKycController,
  getKycByIdController,
  updateKycStatusController,
} from "./kyc.controller";

const router = express.Router();

// USER
router.post(
  "/",
  verifyToken,
  upload.fields([
    { name: "cnicFront", maxCount: 1 },
    { name: "cnicBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  validate(kycSchema),
  submitKycController
);

router.get("/me", verifyToken, getMyKycController);

// ADMIN
router.get("/", verifyToken, roleGuard("ADMIN"), getAllKycController);

router.get("/:id", verifyToken, roleGuard("ADMIN"), getKycByIdController);

router.patch("/:id/status", verifyToken, roleGuard("ADMIN"), updateKycStatusController);

export default router;