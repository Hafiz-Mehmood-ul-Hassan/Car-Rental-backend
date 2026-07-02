import { Router } from "express";

import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = Router();


export default router;