import { Router } from "express";
// import { createPayoutController } from "./payout.controller";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = Router();

router.use(verifyToken);



export default router;