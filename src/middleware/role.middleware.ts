import { Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";
import { AuthRequest } from "./auth.middleware";

export const roleGuard = (...allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        throw new AppError("Role not found", 403);
      }

      if (!allowedRoles.includes(userRole)) {
        throw new AppError("Access denied", 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};