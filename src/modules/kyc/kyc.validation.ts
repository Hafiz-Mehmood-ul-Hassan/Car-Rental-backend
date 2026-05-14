import { z } from "zod";

export const kycSchema = z.object({
  fullName: z.string().min(3),
  cnic: z.string().length(13),
  address: z.string().min(5),
  phone: z.string().min(10),
});