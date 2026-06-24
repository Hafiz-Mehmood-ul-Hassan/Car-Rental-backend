import { Router } from "express";
import {
  adminGetsingleUser,
  adminUpdateUserController,
  getUsersController,
} from "./auth.admin.controller";

const router = Router();

router.get("/", getUsersController);
router.get("/:id", adminGetsingleUser);
router.patch("/:id", adminUpdateUserController);

export default router;