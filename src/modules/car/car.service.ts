import { AppError } from "../../shared/errors/AppError";
import prisma from "../../config/prisma";
import {
  createCarRepo,
  findCarById,
  uploadCarImage,
  updateCarStatusRepo,
  getApprovedCarsRepo,
} from "./car.repository";

export const createCarDraft = async (ownerId: number, data: any) => {
  const {
    title,
    brand,
    model,
    year,
    pricePerDay,
    location,
    description,
  } = data;

  const car = await createCarRepo({
    ownerId,
    title: title.trim(),
    brand: brand.trim(),
    model: model.trim(),
    year: Number(year),
    pricePerDay: Number(pricePerDay),
    location: location.trim(),
    description: description?.trim(),
    status: "DRAFT",
  });

  return car;
};

export const addCarImagesService = async (
  carId: number,
  ownerId: number,
  files: Express.Multer.File[]
) => {
  if (!files || files.length === 0) {
    throw new AppError("No images uploaded", 400);
  }
  
  const car = await findCarById(carId);
  
  if (!car) {
    throw new AppError("Car not found", 404);
  }
  
  if (car.ownerId !== ownerId) {
    throw new AppError("Unauthorized", 403);
  }
  
  if (car.status !== "DRAFT") {
    throw new AppError("Cannot upload images after submission", 400);
  }
  
  const imageData = [];
  
  for (const file of files) {
    // console.log("Files received in service:", files); // Debug log
    
    
    imageData.push({
      carId,
      imageUrl:file.path,
    });
  }

  // ✅ IMPORTANT FIX (MISSING BEFORE)
  await prisma.carImage.createMany({
    data: imageData,
  });

  return {
    count: imageData.length,
  };
};

export const submitCarForReviewService = async (
  carId: number,
  ownerId: number
) => {
  const car = await findCarById(carId);

  if (!car) {
    throw new AppError("Car not found", 404);
  }

  // ownership check
  if (car.ownerId !== ownerId) {
    throw new AppError("Unauthorized", 403);
  }

  // must be draft
  if (car.status !== "DRAFT") {
    throw new AppError("Car already submitted or processed", 400);
  }

  // check images
  if (!car.images || car.images.length === 0) {
    throw new AppError("At least one image is required", 400);
  }

  // check required documents
  const docTypes = car.documents.map((d: any) => d.type);

  const hasRegistration = docTypes.includes("REGISTRATION");
  const hasInsurance = docTypes.includes("INSURANCE");

  if (!hasRegistration || !hasInsurance) {
    throw new AppError(
      "REGISTRATION and INSURANCE documents are required",
      400
    );
  }

  // update status
  const updatedCar = await updateCarStatusRepo(carId, "PENDING");

  return updatedCar;
};
export const uploadCarDocumentService = async (
  carId: number,
  ownerId: number,
  type: string,
  file: Express.Multer.File
) => {
  if (!file) {
    throw new AppError("Document file required", 400);
  }

  const car = await findCarById(carId);

  if (!car) throw new AppError("Car not found", 404);

  if (car.ownerId !== ownerId) {
    throw new AppError("Unauthorized", 403);
  }

  if (car.status !== "DRAFT") {
    throw new AppError("Cannot upload documents after submission", 400);
  }

  const doc = await prisma.carDocument.create({
    data: {
      carId,
      type,
      fileUrl: file.path,
    },
  });

  return doc;
};

export const getPublicCarsService = async (query: any) => {
  const page = query.page || 1;
  const limit = query.limit || 10;

  const skip = (page - 1) * limit;

  const cars = await getApprovedCarsRepo(query, skip, limit);

  return cars;
};