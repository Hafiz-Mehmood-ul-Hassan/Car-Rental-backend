import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";
import { AppError } from "../shared/errors/AppError";
import prisma from "../config/prisma";

export const kycGuard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { kycStatus: true },
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    if (user.kycStatus !== "APPROVED") {
      throw new AppError("KYC not approved", 403);
    }

    next();
  } catch (error) {
    next(error);
  }
};