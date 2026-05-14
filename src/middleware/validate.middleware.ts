import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { sendResponse } from "../shared/responses/apiResponse";

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body); // 👈 validation happens here
      next();
    } catch (err: any) {
      return sendResponse(res, 400, false, err.errors?.[0]?.message || "Validation error");
    }
  };
};