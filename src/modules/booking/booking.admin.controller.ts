import {
  getAllBookingsService,
  getPendingBookingsService,
  getBookingByIdService,
  updateBookingStatusService,
} from "./booking.admin.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const getAllBookingsController = async (req: any, res: any) => {
  const bookings = await getAllBookingsService();
  return sendResponse(res, 200, true, "All bookings fetched successfully", bookings);
};

export const getPendingBookingsController = async (req: any, res: any) => {
  const bookings = await getPendingBookingsService();
  return sendResponse(res, 200, true, "Pending bookings fetched successfully", bookings);
};

export const getBookingByIdController = async (req: any, res: any) => {
  const bookingId = Number(req.params.id);
  const booking = await getBookingByIdService(bookingId);
  return sendResponse(res, 200, true, "Booking fetched successfully", booking);
};

export const updateBookingStatusController = async (req: any, res: any) => {
  const bookingId = Number(req.params.id);
  const { status } = req.body;
  const booking = await updateBookingStatusService(bookingId, status);
  return sendResponse(res, 200, true, "Booking status updated", booking);
};
