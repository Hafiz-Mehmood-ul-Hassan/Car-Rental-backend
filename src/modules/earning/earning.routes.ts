import { Router } from "express";
import { getAllEarningsController } from "./earning.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = Router();

router.get(
  "/",
  verifyToken,
    roleGuard("ADMIN"),
  getAllEarningsController
);

export default router;