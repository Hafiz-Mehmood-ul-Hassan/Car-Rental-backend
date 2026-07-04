import prisma from "../../config/prisma";

import { AppError } from "../../shared/errors/AppError";


import {
  createPayout,
  getOwnerEarning,
  updateOwnerEarning,
} from "./payout.repository";

export const payoutOwnerService = async (
  adminId: number,
  body: any,
  file?: Express.Multer.File
) => {
  const {
  method,
  referenceNo,
  notes,
} = body;

const ownerId = Number(body.ownerId);
const amount = Number(body.amount);

const receiptUrl = file
  ? `/uploads/payouts/${file.filename}`
  : null;

  if (!ownerId || !amount || !method) {
    throw new AppError("Missing required fields", 400);
  }

  const earning = await getOwnerEarning(ownerId);

  if (!earning) {
    throw new AppError("Owner earning record not found", 404);
  }

  if (amount <= 0) {
    throw new AppError("Invalid payout amount", 400);
  }

  if (amount > earning.remainingAmount) {
    throw new AppError(
      "Amount exceeds remaining balance",
      400
    );
  }

  return prisma.$transaction(async () => {
    const payout = await createPayout({
      ownerId,
      paidById: adminId,
      amount,
      method,
      referenceNo,
      receiptUrl,
      notes,
    });

    await updateOwnerEarning(ownerId, amount);

    return payout;
  });
};