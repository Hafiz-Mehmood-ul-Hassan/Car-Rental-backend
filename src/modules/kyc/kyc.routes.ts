import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { createUpload } from "../../config/upload.factory";
const upload = createUpload("kyc");
import { kycSchema } from "./kyc.validation";

import {
  submitKycController,
  getMyKycController,
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

export default router;