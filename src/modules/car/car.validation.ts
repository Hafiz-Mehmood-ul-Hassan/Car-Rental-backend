import { z } from "zod";

export const createCarSchema = z.object({
  title: z.string().min(1).max(100),

  brand: z.string().min(1).max(50),

  model: z.string().min(1).max(50),

  year: z.coerce
    .number()
    .int()
    .min(1980)
    .max(new Date().getFullYear() + 1),

  pricePerDay: z.coerce.number().positive().max(1000000),

  location: z.string().min(1).max(100),

  description: z.string().max(500).optional(),
});
export const carIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});
export const rejectCarSchema = z.object({
  id: z.coerce.number().int().positive(),

  note: z.string().min(5).max(500),
});
export const approveCarSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(10),
});

export const carFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(100).default(10),

  brand: z.string().optional(),

  location: z.string().optional(),

  minPrice: z.coerce.number().optional(),

  maxPrice: z.coerce.number().optional(),
});


export const publicCarQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),

  limit: z.coerce.number().int().positive().max(50).default(10),

  brand: z.string().optional(),

  location: z.string().optional(),

  minPrice: z.coerce.number().optional(),

  maxPrice: z.coerce.number().optional(),
});