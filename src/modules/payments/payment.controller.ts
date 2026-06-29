import { Request, Response } from "express";
import {
  createPaymentSession,
  handleStripeCheckoutSuccess,
  uploadPaymentReceipt,
  getUserPayments as getUserPaymentsService,
  verifyStripeSession as verifyStripeSessionService,
} from "./payment.service";
import { sendResponse } from "../../shared/responses/apiResponse";
import { stripe } from "./stripe";

export const createPaymentController = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { bookingId } = req.body;
  const result = await createPaymentSession(Number(bookingId), userId);
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

export const stripeWebhookController = async (req: any, res: Response) => {
  const signature = req.headers["stripe-signature"];

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET || !stripe) {
    return sendResponse(res, 400, false, "Stripe webhook configuration missing");
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      await handleStripeCheckoutSuccess(session.id);
      return sendResponse(res, 200, true, "Payment completed");
    }

    return sendResponse(res, 200, true, "Webhook received");
  } catch (error: any) {
    return sendResponse(res, 400, false, error.message || "Webhook verification failed");
  }
};

export const verifyStripeSessionController = async (req: any, res: Response) => {
  const userId = req.user.id;
  const sessionId = req.params.sessionId || req.query.session_id;

  if (!sessionId) {
    return sendResponse(res, 400, false, "Session ID is required");
  }

  const result = await verifyStripeSessionService(String(sessionId), userId);
  return sendResponse(res, 200, true, result.message || "Payment verified", result);
};

export const getUserPayments = async (req: any, res: Response) => {
  const userId = req.user.id;
  const data = await getUserPaymentsService(userId);
  return sendResponse(res, 200, true, "User payments fetched", data);
};