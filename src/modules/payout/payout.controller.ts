import { Request, Response } from "express";
import { createPayout } from "./payout.service";

export const createPayoutController = async (
  req: Request,
  res: Response
) => {

  const adminId = req.user.id;

  const payout = await createPayout(adminId, req.body);

  res.status(201).json({
    success: true,
    data: payout,
  });

};