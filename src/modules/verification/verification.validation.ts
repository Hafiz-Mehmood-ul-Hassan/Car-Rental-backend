import { z } from "zod";

export const verifySessionSchema = z.object({
  token: z.string().min(1),
  data: z.record(z.any()).optional(),
});