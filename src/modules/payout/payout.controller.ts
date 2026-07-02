import { Request, Response, NextFunction } from "express";
import { payoutOwnerService } from "./payout.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const payoutOwnerController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const receiptUrl = req.file
      ? `/uploads/payouts/${req.file.filename}`
      : null;

    const payout = await payoutOwnerService(
      req.user.id,
      {
        ...req.body,
        receiptUrl,
      }
    );

    return sendResponse(
      res,
      200,
      true,
      "Payout processed successfully",
      payout
    );
  } catch (error) {
    next(error);
  }
};