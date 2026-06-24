import express from "express";
import { 
    forgot, login, register, reset,
    me,changeUserPassword,updateMe,deleteMe,
    refreshToken
} from "./auth.controller";
import { validate } from "../../middleware/validate.middleware";
import { changePasswordSchema, forgotPasswordSchema, loginSchema, registerSchema, resetPasswordSchema, refreshTokenSchema } from "./auth.validation";
import { verifyToken } from "../../middleware/auth.middleware";
import { roleGuard } from "../../middleware/role.middleware";

const router = express.Router();

// =============================
// auth routes
// =============================

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/refresh-token", validate(refreshTokenSchema), refreshToken);
router.post("/forgot-password", validate(forgotPasswordSchema), forgot);
router.post("/reset-password", validate(resetPasswordSchema), reset);

// =============================
// user routes
// =============================
router.get("/me", verifyToken, me);
router.patch("/change-password",verifyToken,validate(changePasswordSchema),changeUserPassword);
router.patch("/me/update", verifyToken, updateMe);
router.delete("/me/delete", verifyToken, deleteMe); 

// =============================
// admin routes
// =============================

export default router;