import { Request, Response } from "express";
import {
  createReview,
  getCarReviews,
  getUserReviews,
  adminGetReviews,
  adminUpdateReview,
  adminDeleteReview,
} from "./review.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const createReviewController = async (req: any, res: Response) => {
  const { carId, rating, comment } = req.body;
  const review = await createReview(req.user.id, Number(carId), Number(rating), comment);
  sendResponse(res, 201, true, "Review created", review);
};

export const getCarReviewsController = async (req: Request, res: Response) => {
  const carId = Number(req.params.carId);
  const reviews = await getCarReviews(carId);
  sendResponse(res, 200, true, "Car reviews fetched", reviews);
};

export const getUserReviewsController = async (req: any, res: Response) => {
  const reviews = await getUserReviews(req.user.id);
  sendResponse(res, 200, true, "User reviews fetched", reviews);
};

// Admin
export const adminGetReviewsController = async (req: Request, res: Response) => {
  const reviews = await adminGetReviews();
  sendResponse(res, 200, true, "All reviews fetched", reviews);
};

export const adminUpdateReviewController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const data = req.body;
  const review = await adminUpdateReview(id, data);
  sendResponse(res, 200, true, "Review updated", review);
};

export const adminDeleteReviewController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  await adminDeleteReview(id);
  sendResponse(res, 200, true, "Review deleted", null);
};
