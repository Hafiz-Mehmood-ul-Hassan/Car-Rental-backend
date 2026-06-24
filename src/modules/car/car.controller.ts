import { Request, Response, NextFunction } from "express";
import {
  createCarDraft,
  addCarImagesService,
  uploadCarDocumentService,
  submitCarForReviewService,
  getPublicCarsService,
  getOwnerCarsService,
  updateCarAvailabilityService,
} from "./car.service";
import { AppError } from "../../shared/errors/AppError";
import { sendResponse } from "../../shared/responses/apiResponse";
import prisma from "../../config/prisma";
import { findCarById } from "./car.repository";
  
// extend request type properly (recommended)
interface AuthRequest extends Request {
  user?: any;
  files?: any[];
}

export const createCarDraftController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ownerId = req.user.id;

    const car = await createCarDraft(ownerId, req.body);

    sendResponse(res, 201, true, "Car draft created successfully", car);
  } catch (error) {
    next(error);
  }
};

export const uploadCarImagesController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = Number(req.params.id);
    const ownerId = req.user.id;
    
    // console.log("Files received in controller:", req.files); // Debug log
    const result = await addCarImagesService(
      carId,
      ownerId,
      req.files || []
    );

    sendResponse(res, 200, true, "Car images uploaded successfully", result);
  } catch (error) {
    next(error);
  }
};

export const submitCarController = async (req: any, res: Response) => {
  const carId = Number(req.params.id);
  const ownerId = req.user.id;

  const result = await submitCarForReviewService(carId, ownerId);
  return sendResponse(res, 200, true, "Car submitted for review successfully", result);
};

export const updateCarAvailabilityController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const carId = Number(req.params.id);
    const ownerId = req.user.id;
    const isAvailable = req.body?.available;

    if (typeof isAvailable !== "boolean") {
      throw new AppError("Available must be a boolean", 400);
    }

    const result = await updateCarAvailabilityService(carId, ownerId, isAvailable);
    sendResponse(
      res,
      200,
      true,
      `Car is now ${isAvailable ? "available" : "unavailable"} for rent`,
      result
    );
  } catch (error) {
    next(error);
  }
};

export const uploadCarDocumentController = async (req: any, res: Response) => {
  const carId = Number(req.params.id);
  const ownerId = req.user.id;

  const type = req.body?.type;
  const file = req.file;

  if (!type) {
    throw new AppError("Document type is required", 400);
  }

  const result = await uploadCarDocumentService(
    carId,
    ownerId,
    type,
    file
  );
  sendResponse(res, 200, true, "Car document uploaded successfully");
};

export const getPublicCarController = async (req: Request, res: Response) => {
  // console.log("Fetching public car with ID:", req.params.id); // Debug log
  const carId = Number(req.params.id);
  const car = await findCarById(carId);
  // console.log("Car fetched from database:", car); // Debug log
  if (!car) {
    // console.log("Car not found or not approved"); // Debug log
    throw new AppError("Car not found or not approved", 404);
  }
  sendResponse(res, 200, true, "Public car retrieved successfully", car);
};

export const getPublicCarsController = async (req: Request, res: Response) => {
  const data = await getPublicCarsService(req.query);
  sendResponse(res, 200, true, "Cars fetched successfully", data);
};

export const getOwnerCarsController = async (req: AuthRequest, res: Response) => {
  const ownerId = req.user.id;
  const data = await getOwnerCarsService(ownerId);
  sendResponse(res, 200, true, "Cars fetched successfully", data);
};