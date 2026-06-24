import { Request, Response, NextFunction } from "express";
import { changePassword, forgotPassword, getMe, loginUser,getUsersService, registerUser,deleteMeService, resetPassword,updateMeService, adminGetUserByIdservice, adminUpdateUserService, refreshUserToken } from "./auth.service";
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

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshUserToken(refreshToken);

    return sendResponse(res, 200, true, "Token refreshed successfully", result);
  } catch (error) {
    next(error);
  }
};


export const forgot = async (req: Request, res: Response, next: NextFunction) => {
  try {
      // console.log("Forgot password result:", req.body.email);
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
// =============================
// user controllers
// =============================

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

export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const updatedUser = await updateMeService(userId, req.body);
    return sendResponse(
      res,
      200,
      true,
      "Profile updated successfully",
      updatedUser
    );
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;

    await deleteMeService(userId);

    return sendResponse(
      res,
      200,
      true,
      "Profile deleted successfully"
    );
  } catch (error) {
    next(error);
  }
};

export const adminGetsingleUser = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await adminGetUserByIdservice(userId);
    return sendResponse(
      res,
      200,
      true,
      "User fetched successfully",  
      user
     );
  } catch (error) {
    next(error);
  }
};

export const getUsersController = async (
  req: any,
  res: Response
) => {
  try {
    const filters = req.query;

    const users = await getUsersService(filters);
    return sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error) {
    return sendResponse(res, 500, false, "Failed to fetch users");
  }
};

export const adminUpdateUserController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    // console.log("Admin update user data:", { id, data });
    const updatedUser = await adminUpdateUserService(id, data);

    return sendResponse(res, 200, true, "User updated successfully", updatedUser);
  } catch (error) {
    return sendResponse(res, 500, false, "Failed to update user");
  }
  };
  

