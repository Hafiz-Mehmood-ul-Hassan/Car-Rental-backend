import express from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";
import { carUpload } from "./car.upload";
import * as controller from "./car.controller";
import { kycGuard } from "../../middleware/kyc.middleware";
import { createCarSchema } from "./car.validation";
import { validate } from "../../middleware/validate.middleware";

const router = express.Router();

// ================= OWNER =================

router.post(
  "/owner",
  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  validate(createCarSchema),
  carUpload.array("images", 5),
  controller.createCar
);

router.get(
  "/owner",
  verifyToken,
  roleGuard("CAR_OWNER"),
  controller.getOwnerCars
);

router.patch(
  "/owner/:id",
  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  validate(createCarSchema),
  controller.updateOwnCar
);

router.delete(
  "/owner/:id",
  verifyToken,
  roleGuard("CAR_OWNER"),
  kycGuard,
  controller.deleteOwnCar
);


// ================= ADMIN =================

router.get(
  "/admin",
  verifyToken,
  roleGuard("ADMIN"),
  controller.getAllCarsAdmin
);

router.patch(
  "/admin/:id/status",
  verifyToken,
  roleGuard("ADMIN"),
  controller.updateCarStatus
);

router.delete(
  "/admin/:id",
  verifyToken,
  roleGuard("ADMIN"),
  controller.deleteCarAdmin
);


// ================= PUBLIC =================

router.get("/", controller.getApprovedCars);
router.get("/:id", controller.getCarById);

export default router;