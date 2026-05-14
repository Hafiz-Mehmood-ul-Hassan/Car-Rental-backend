import prisma from "../../config/prisma";
import { AppError } from "../../shared/errors/AppError";
import {
  createKyc,
  findKycByUserId,
  findKycById,
  findAllKyc,
  updateKyc,
} from "./kyc.repository";

// USER
export const submitKyc = async (userId: number, data: any, files: any) => {
  const existing = await findKycByUserId(userId);

  if (existing) throw new AppError("KYC already submitted", 400);

  await createKyc({
      userId,
      ...data,
      cnicFront: files?.cnicFront?.[0]?.path,
      cnicBack: files?.cnicBack?.[0]?.path,
      selfie: files?.selfie?.[0]?.path,
    });
    // # update user kyc status to pending
    await prisma.user.update({
      where: { id: userId },
      data: { kycStatus: "PENDING" },
    });
    return true;
};

export const getMyKyc = (userId: number) => findKycByUserId(userId);

// ADMIN
export const getAllKyc = () => findAllKyc();

export const getKycById = async (id: number) => {
  const kyc = await findKycById(id);
  if (!kyc) throw new AppError("KYC not found", 404);
  return kyc;
};

export const updateKycStatus = async (
  id: number,
  status: "APPROVED" | "REJECTED",
  reviewNote?: string
) => {
  const kyc = await findKycById(id);
  if (!kyc) throw new AppError("KYC not found", 404);

  if (status === "REJECTED" && !reviewNote) {
    throw new AppError("Review note required for rejection", 400);
  }

  await updateKyc(id, {
    status,
    reviewNote,
  });

  await prisma.user.update({
    where: { id: kyc.userId },
    data: {
      kycStatus: status,
      isVerified: status === "APPROVED",
    },
  });

  return true;
};