import { Request, Response, NextFunction } from "express";
import { changePassword, forgotPassword, getMe, loginUser, registerUser, resetPassword } from "./auth.service";
import { sendResponse } from "../../shared/responses/apiResponse";
import { AuthRequest } from "../../middleware/auth.middleware";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await registerUser(req.body);

    return sendResponse(res, 201, true, "User registered successfully", user);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);

    return sendResponse(res, 200, true, "Login successful", result);
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const user = await getMe(userId);

    return sendResponse(res, 200, true, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const forgot = async (req: Request, res: Response, next: NextFunction) => {
  try {
      console.log("Forgot password result:", req.body.email);
    const result = await forgotPassword(req.body.email);

    return sendResponse(res, 200, true, "Reset link generated", result);
  } catch (error) {
    next(error);
  }
};

export const reset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, password } = req.body;

    const result = await resetPassword(token, password);

    return sendResponse(res, 200, true, result.message);
  } catch (error) {
    next(error);
  }
};

export const changeUserPassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    const { oldPassword, newPassword } = req.body;

    await changePassword(userId, oldPassword, newPassword);

    return sendResponse(
      res,
      200,
      true,
      "Password changed successfully"
    );
  } catch (error) {
    next(error);
  }
};
