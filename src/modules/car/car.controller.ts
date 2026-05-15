import { Request, Response, NextFunction } from "express";
import { createCarDraft, addCarImagesService,uploadCarDocumentService } from "./car.service";
import { AppError } from "../../shared/errors/AppError";
import { sendResponse } from "../../shared/responses/apiResponse";
  
// extend request type properly (recommended)
interface AuthRequest extends Request {
  user?: any;
  files?: Express.Multer.File[];
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

  res.json({
    success: true,
    message: "Car submitted for review successfully",
    data: result,
  });
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
  //  update car status to PENDING after document upload
  await prisma.car.update({
    where: { id: carId },
    data: { status: "PENDING" },
  });
  sendResponse(res, 200, true, "Car document uploaded successfully");
};