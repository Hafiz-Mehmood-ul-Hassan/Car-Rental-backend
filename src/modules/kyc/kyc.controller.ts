import { Response, NextFunction } from "express";
import { AuthRequest } from "../../middleware/auth.middleware";
import { sendResponse } from "../../shared/responses/apiResponse";
import {
  submitKyc,
  getMyKyc,
  getAllKyc,
  getKycById,
  updateKycStatus,
} from "./kyc.service";

// USER
export const submitKycController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await submitKyc(req.user.id, req.body, req.files);

    return sendResponse(res, 201, true, "KYC submitted" );
  } catch (err) {
    next(err);
  }
};

export const getMyKycController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getMyKyc(req.user.id);
    return sendResponse(res, 200, true, "My KYC", result);
  } catch (err) {
    next(err);
  }
};

// ADMIN
export const getAllKycController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getAllKyc();
    return sendResponse(res, 200, true, "All KYCs", result);
  } catch (err) {
    next(err);
  }
};

export const getKycByIdController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getKycById(Number(req.params.id));
    return sendResponse(res, 200, true, "KYC details", result);
  } catch (err) {
    next(err);
  }
};

export const updateKycStatusController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status, reviewNote } = req.body;

    await updateKycStatus(Number(req.params.id), status, reviewNote);

    return sendResponse(res, 200, true, `KYC ${status.toLowerCase()}`);
  } catch (err) {
    next(err);
  }
};