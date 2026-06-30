import { Request, Response } from "express";
import { createBooking,
       getOwnerBookings, 
       getUserBookings, 
       requestReturn, 
       acceptReturn, 
       completeReturnByUser,
       } from "./booking.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const createBookingController = async (req: any, res: Response) => {
  const booking = await createBooking(req.user.id, req.body);

  sendResponse(res, 201, true, "Booking created", booking);
};

export const getUserBookingsController = async (req: any, res: Response) => {
  const bookings = await getUserBookings(req.user.id);
  sendResponse(res, 200, true, "User bookings fetched", bookings);
};
export const requestReturnController = async (req: any, res: Response) => {
  const booking = await requestReturn(req.user.id, Number(req.params.id));
  sendResponse(res, 200, true, "Return requested", booking);
};

export const acceptReturnController = async (req: any, res: Response) => {
  const booking = await acceptReturn(req.user.id, Number(req.params.id));
  sendResponse(res, 200, true, "Return accepted and booking completed", booking);
};
// export const completeReturnByUserController = async (req: any, res: Response) => {
//   const booking = await completeReturnByUser(req.user.id, Number(req.params.id));
//   sendResponse(res, 200, true, "Booking completed by user", booking);
// };
export const getOwnerBookingsController = async (req: any, res: Response) => {
  const bookings = await getOwnerBookings(req.user.id);
  sendResponse(res, 200, true, "Owner bookings fetched", bookings);
};

export const createCheckoutSessionController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookingId = Number(req.params.bookingId);
    const userId = req.user.id;

    const result = await createCheckoutSession(
      bookingId,
      userId
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Checkout session created",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};