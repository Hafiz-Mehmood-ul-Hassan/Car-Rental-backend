import { Request, Response, NextFunction } from "express";
import {
  createRegistrationVerification,
  verifySession,
} from "./verification.service";

export const createRegistrationVerificationController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await createRegistrationVerification({
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return res.status(200).json({
      success: true,
      message:
        "Verification email sent successfully.",
    });
  } catch (error) {
    next(error);
  }
};

export const verifySessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await verifySession(
      req.body.token,
      req.body.data
    );

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};