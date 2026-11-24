import { z } from 'zod';

export const CreateProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sizeKg: z.number().positive('Size must be positive'), // e.g., 19, 14.2
  defaultPricePaise: z.number().int().positive('Price must be positive'), // e.g., 100000 for ₹1000
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;