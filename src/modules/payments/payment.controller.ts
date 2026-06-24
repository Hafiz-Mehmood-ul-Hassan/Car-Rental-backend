import { Request, Response } from "express";
import { createPaymentSession, uploadPaymentReceipt } from "./payment.service";
import { getUserPayments as getUserPaymentsService } from "./payment.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const createPaymentController = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { bookingId } = req.body;
  const result = await createPaymentSession(bookingId, userId);
  return sendResponse(res, 200, true, result.message || "Payment created", result);
};

export const uploadReceiptController = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { bookingId } = req.body;
  const file = req.file;

  if (!file) {
    return sendResponse(res, 400, false, "Receipt file required");
  }

  const payment = await uploadPaymentReceipt(Number(bookingId), userId, file);

  return sendResponse(res, 200, true, "Receipt uploaded", payment);
};

export const getUserPayments = async (req: any, res: Response) => {
  const userId = req.user.id;
  const data = await getUserPaymentsService(userId);
  return sendResponse(res, 200, true, "User payments fetched", data);
};