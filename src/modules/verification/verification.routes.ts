import { Router } from "express";

import { verifySessionController } from "./verification.controller";
import { validate } from "../../middleware/validate.middleware";
import { verifySessionSchema } from "./verification.validation";

const router = Router();

router.post(
  "/verify",
  validate(verifySessionSchema),
  verifySessionController
);

export default router;