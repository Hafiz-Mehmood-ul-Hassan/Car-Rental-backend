import { Request, Response } from "express";
import { createBooking } from "./booking.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const createBookingController = async (req: any, res: Response) => {
  const booking = await createBooking(req.user.id, req.body);

  sendResponse(res, 201, true, "Booking created", booking);
};