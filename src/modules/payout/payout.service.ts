import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import {
  createPayoutRepo,
  findEarningByIdRepo,
  updateEarningRepo,
} from "./payout.repository";

export const createPayout = async (
  adminId: number,
  data: any
) => {

  const {
    earningId,
    amount,
    method,
    referenceNo,
    receiptUrl,
    notes,
  } = data;

  const earning = await findEarningByIdRepo(earningId);

  if (!earning) {
    throw new AppError("Earning not found", 404);
  }

  const remaining = earning.netAmount - earning.paidAmount;

  if (amount <= 0) {
    throw new AppError("Invalid payout amount", 400);
  }

  if (amount > remaining) {
    throw new AppError("Amount exceeds remaining balance", 400);
  }

  return prisma.$transaction(async (tx) => {

    const payout = await createPayoutRepo(
      {
        ownerId: earning.ownerId,
        paidById: adminId,
        amount,
        method,
        referenceNo,
        receiptUrl,
        notes,
      },
      tx
    );

    const newPaidAmount = earning.paidAmount + amount;

    let status = earning.status;

    if (newPaidAmount >= earning.netAmount) {
      status = "PAID";
    } else {
      status = "PARTIALLY_PAID";
    }

    await updateEarningRepo(
      earning.id,
      {
        paidAmount: newPaidAmount,
        status,
      },
      tx
    );

    return payout;
  });

};