import express from "express";
import {
  createCarDraftController,
  uploadCarImagesController,
} from "./car.controller";

import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { kycGuard } from "../../middleware/kyc.middleware";
import { createCarSchema,publicCarQuerySchema } from "./car.validation";
import {
  getPendingCarsController,
  approveCarController,
  rejectCarController,
  getPublicCarsController,
} from "./car.admin.controller";
import { uploadCarDocumentController } from "./car.controller";

// 👇 your generic upload middleware
import { upload } from "./../../config/upload";
import { carUpload } from "./car.upload";

const router = express.Router();

// =======================
// 🚗 CREATE CAR DRAFT
// =======================
router.post(
  "/",
  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  validate(createCarSchema),
  createCarDraftController
);

// =======================
// 🖼 UPLOAD CAR IMAGES
// =======================
router.post(
  "/:id/images",

  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,

  carUpload.array("images", 5),

  uploadCarImagesController
);
router.post(
  "/:id/documents",

  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  
  carUpload.single("documents", 5),
  uploadCarDocumentController
);
// =======================
// 📋 ADMIN ROUTES
// =======================
router.get(
  "/admin/pending",
  verifyToken,
  roleGuard("ADMIN"),
  getPendingCarsController
);

router.patch(
  "/admin/:id/approve",
  verifyToken,
  roleGuard("ADMIN"),
  approveCarController
);

router.patch(
  "/admin/:id/reject",
  verifyToken,
  roleGuard("ADMIN"),
  rejectCarController
);

// =======================
// 🌐 PUBLIC ROUTES
// =======================

router.get(
  "/public",
  // validate(publicCarQuerySchema),
  getPublicCarsController
);
export default router;