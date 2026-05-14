import { Request, Response, NextFunction } from "express";
import { AppError } from "../shared/errors/AppError";

export const validateBooking = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { carId, startDate, endDate } = req.body;

  if (!carId || !startDate || !endDate) {
    return next(new AppError("Missing required fields", 400));
  }

  if (isNaN(Number(carId))) {
    return next(new AppError("Invalid carId", 400));
  }

  next();
};