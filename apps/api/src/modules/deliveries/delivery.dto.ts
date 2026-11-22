import { z } from 'zod';

export const CreateDeliverySchema = z.object({
  tripId: z.string().uuid('Invalid Trip ID'),
  customerId: z.string().uuid('Invalid Customer ID'),
  filledOut: z.number().int().nonnegative('Filled out cannot be negative'),
  emptyIn: z.number().int().nonnegative('Empty in cannot be negative'),
  paymentType: z.enum(['cash', 'online', 'pending']).default('pending'),
  // 10 min discount window ke liye
  applyDiscount: z.boolean().default(false), 
});

export type CreateDeliveryDTO = z.infer<typeof CreateDeliverySchema>;