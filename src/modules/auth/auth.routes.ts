import express from "express";
import { changeUserPassword, forgot, login, me, register, reset  } from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema,  } from "./auth.validation";
import { verifyToken } from "../../middleware/auth.middleware";

const router = express.Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", verifyToken, me);
router.patch("/change-password",verifyToken,validate(changePasswordSchema),changeUserPassword);
router.post("/forgot-password", validate(forgotPasswordSchema), forgot);
router.post("/reset-password", validate(resetPasswordSchema), reset);


export default router;