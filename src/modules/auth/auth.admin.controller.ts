import { Request, Response, NextFunction } from "express";
import {
  getUsersService,
  adminGetUserByIdservice,
  adminUpdateUserService,
} from "./auth.service";
import { sendResponse } from "../../shared/responses/apiResponse";

export const getUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const filters = req.query;
    const users = await getUsersService(filters);
    return sendResponse(res, 200, true, "Users fetched successfully", users);
  } catch (error) {
    next(error);
  }
};

export const adminGetsingleUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await adminGetUserByIdservice(userId);
    return sendResponse(res, 200, true, "User fetched successfully", user);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const updatedUser = await adminUpdateUserService(id, data);

    return sendResponse(res, 200, true, "User updated successfully", updatedUser);
  } catch (error) {
    next(error);
  }
};