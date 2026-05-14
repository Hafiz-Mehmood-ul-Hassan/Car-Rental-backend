import { Request, Response } from "express";
import { createPaymentSession } from "./payment.service";

export const createPaymentController = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { bookingId } = req.body;

  const url = await createPaymentSession(bookingId, userId);

  res.json({
    success: true,
    message: "Payment session created",
    url,
  });
};