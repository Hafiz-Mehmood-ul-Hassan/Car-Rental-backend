import { Router } from "express";
import { getAllEarningsController } from "./earning.admin.controller";

const router = Router();

router.get(
  "/",
  getAllEarningsController
);

export default router;