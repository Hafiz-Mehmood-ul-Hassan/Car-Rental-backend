import { Request, Response } from "express";
import { getAllEarnings } from "./earning.service";

export const getAllEarningsController = async (
  req: Request,
  res: Response
) => {
  const earnings = await getAllEarnings();

  res.status(200).json({
    success: true,
    data: earnings,
  });
};