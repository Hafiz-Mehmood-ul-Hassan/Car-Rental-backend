import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";

export const createReview = async (userId: number, carId: number, rating: number, comment?: string) => {
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) throw new AppError("Car not found", 404);

  if (rating < 1 || rating > 5) throw new AppError("Rating must be between 1 and 5", 400);

  const review = await prisma.review.create({
    data: {
      userId,
      carId,
      rating,
      comment,
      // default status is PENDING so admin can moderate
    },
  });

  return review;
};

export const getCarReviews = async (carId: number) => {
  return prisma.review.findMany({
    where: { carId, status: "VISIBLE" },
    include: { user: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
};

export const getUserReviews = async (userId: number) => {
  return prisma.review.findMany({ where: { userId }, include: { car: true }, orderBy: { createdAt: "desc" } });
};

export const adminGetReviews = async () => {
  return prisma.review.findMany({ include: { user: true, car: true }, orderBy: { createdAt: "desc" } });
};

export const adminUpdateReview = async (reviewId: number, data: { status?: string; adminNote?: string }) => {
  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing) throw new AppError("Review not found", 404);

  return prisma.review.update({ where: { id: reviewId }, data });
};

export const adminDeleteReview = async (reviewId: number) => {
  const existing = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!existing) throw new AppError("Review not found", 404);
  return prisma.review.delete({ where: { id: reviewId } });
};
