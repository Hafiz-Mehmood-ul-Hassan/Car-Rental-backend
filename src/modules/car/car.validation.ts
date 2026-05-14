import { z } from "zod";

export const createCarSchema = z.object({
  title: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  pricePerDay: z.number(),
  location: z.string(),
  description: z.string().optional(),
});