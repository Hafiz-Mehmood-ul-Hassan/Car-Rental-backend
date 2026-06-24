import { Response } from "express";
import {
  getPendingCarsService,
  approveCarService,
  rejectCarService,
  getAllCarsService,
} from "./car.admin.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const getAllCarsController = async (req: any, res: Response) => {
  const cars = await getAllCarsService();
  sendResponse(res, 200, true, "All cars fetched successfully", cars);
};

export const getPendingCarsController = async (req: any, res: Response) => {
  const cars = await getPendingCarsService();
  sendResponse(res, 200, true, "Pending cars fetched successfully", cars);
};

export const approveCarController = async (req: any, res: Response) => {
  const carId = Number(req.params.id);
  const result = await approveCarService(carId);
  sendResponse(res, 200, true, "Car approved successfully", result);
};

export const rejectCarController = async (req: any, res: Response) => {
  const carId = Number(req.params.id);
  const { note } = req.body;
  const result = await rejectCarService(carId, note);
  sendResponse(res, 200, true, "Car rejected successfully", result);
};