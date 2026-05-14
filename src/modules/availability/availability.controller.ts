import { Request, Response } from "express";
import { checkCarAvailability } from "./availability.service";
import { sendResponse } from "../../shared/responses/apiResponse";
export const getAvailability = async (req: Request, res: Response) => {
  const carId = Number(req.params.id);
  const { startDate, endDate } = req.query;

if (!req.query.startDate || !req.query.endDate) {
  return sendResponse(res, 400, false, "startDate and endDate required");
}

  const result = await checkCarAvailability(
    carId,
    String(startDate),
    String(endDate)
  );

  sendResponse(res, 200, true, "Availability checked successfully", result);
};