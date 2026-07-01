import { Request, Response } from "express";
import { getAllEarningsService } from "./earning.admin.service";




export const getAllEarningsController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
    console.log("admin api hit");
  try {
    const earnings = await getAllEarningsService();

    res.status(200).json({
      success: true,
      message: "Earnings fetched successfully",
      data: earnings,
    });
  } catch (error) {
    next(error);
  }
};