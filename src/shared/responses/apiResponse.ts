import { Response } from "express";
import { success } from "zod";

export const sendResponse = (
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: any = null
) => {
  return res.status(statusCode).json({
    success,
    statusCode,
    message,
    data,
  });
};