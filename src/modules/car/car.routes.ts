import express from "express";
import {
  createCarDraftController,
  getOwnerCarsController,
  getPublicCarsController,
  getPublicCarController,
  uploadCarImagesController,
  submitCarController,
  updateCarAvailabilityController,
  uploadCarDocumentController,
} from "./car.controller";

import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import { validate } from "../../middleware/validate.middleware";
import { kycGuard } from "../../middleware/kyc.middleware";
import { createCarSchema,publicCarQuerySchema } from "./car.validation";

import { carUpload } from "./car.upload";

const router = express.Router();

// =======================
// 🚗 CREATE CAR DRAFT
// =======================
router.get("/owner", verifyToken, roleGuard("CAR_OWNER"), kycGuard, getOwnerCarsController);

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
  
  carUpload.single("documents"),
  uploadCarDocumentController
);

// =======================
// 📤 SUBMIT CAR FOR REVIEW
// =======================
router.patch(
  "/:id/availability",
  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  updateCarAvailabilityController
);

router.patch(
  "/:id/submit",
  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  submitCarController
);

// =======================
// 🌐 PUBLIC ROUTES
// =======================

router.get(
  "/public",
  // validate(publicCarQuerySchema),
  getPublicCarsController
);
// single car details route
router.get("/public/:id", getPublicCarController );
export default router;