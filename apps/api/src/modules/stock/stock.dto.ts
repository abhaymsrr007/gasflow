import { z } from 'zod';

export const StockReceiptSchema = z.object({
  productId: z.string().uuid(),
  warehouseId: z.string().uuid().default('default-warehouse-id'), // Abhi ke liye default
  filledQuantity: z.number().int().nonnegative(),
  emptyQuantity: z.number().int().nonnegative(),
});

export type StockReceiptDTO = z.infer<typeof StockReceiptSchema>;