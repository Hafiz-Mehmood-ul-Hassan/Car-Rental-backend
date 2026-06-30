import { Router } from "express";
import { createPayoutController } from "./payout.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);

router.post(
  "/",
    roleGuard("ADMIN"),
  createPayoutController
);

export default router;