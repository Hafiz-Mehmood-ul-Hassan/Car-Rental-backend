import { Request, Response } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import * as service from "./car.service";
import { sendResponse } from "../../shared/responses/apiResponse";


// ================= OWNER =================

export const createCar = async (req: AuthRequest, res: Response) => {
  const ownerId = req.user!.id;

  const files = req.files as Express.Multer.File[];

  const images = files?.map((file) =>
    file.path.replace(/\\/g, "/")
  );

  const car = await service.createCarService(ownerId, req.body, images);

  return sendResponse(res, 201,true, "Car submitted successfully", car);
};

export const getOwnerCars = async (req: AuthRequest, res: Response) => {
  const data = await service.getOwnerCarsService(req.user!.id);

  return sendResponse(res, 200, true, "Owner cars fetched", data);
};

export const updateOwnCar = async (req: AuthRequest, res: Response) => {
  const data = await service.updateOwnCarService(
    req.user!.id,
    Number(req.params.id),
    req.body
  );

  return sendResponse(res, 200, true, "Car updated", data);
};

export const deleteOwnCar = async (req: AuthRequest, res: Response) => {
  const data = await service.deleteOwnCarService(
    req.user!.id,
    Number(req.params.id)
  );

  return sendResponse(res, 200, true, "Car deleted", data);
};


// ================= ADMIN =================

export const getAllCarsAdmin = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;

  const data = await service.getAllCarsAdminService(page, limit);

  return sendResponse(res, 200, true, "All cars fetched", data);
};

export const updateCarStatus = async (req: Request, res: Response) => {
  const { status, reviewNote } = req.body;

  const data = await service.updateCarStatusService(
    Number(req.params.id),
    status,
    reviewNote
  );

  return sendResponse(res, 200, true, "Car status updated", data);
};

export const deleteCarAdmin = async (req: Request, res: Response) => {
  const data = await service.deleteCarAdminService(Number(req.params.id));

  return sendResponse(res, 200, true, "Car deleted", data);
};


// ================= PUBLIC =================

export const getApprovedCars = async (req: Request, res: Response) => {
  const data = await service.getApprovedCarsService();

  return sendResponse(res, 200, true, "Approved cars fetched", data);
};

export const getCarById = async (req: Request, res: Response) => {
  const data = await service.getCarByIdService(Number(req.params.id));

  return sendResponse(res, 200, true, "Car details fetched", data);
};