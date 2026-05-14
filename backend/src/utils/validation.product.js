import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  price: z.coerce.number().positive("Price must be a positive number"),
  category: z.string().min(1, "Category is required"),
  stock: z.coerce
    .number()
    .int()
    .nonnegative("Stock must be a non-negative integer"),
  images: z.any().optional(),
});

export const productIdSchemaParams = z.object({
  productid: z.coerce.number().int().positive(),
});

export const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().min(1, "Description is required").optional(),
  price: z.coerce.number().positive("Price must be a positive number").optional(),
  category: z.string().min(1, "Category is required").optional(),
  stock: z
    .coerce.number()
    .int()
    .nonnegative("Stock must be a non-negative integer")
    .optional(),
  images: z.any().optional(),
});
