import { z } from 'zod';

export const CreateTripSchema = z.object({
  vehicleNumber: z.string().min(2, 'Vehicle number is required'),
  driverId: z.string().uuid('Invalid Driver ID'),
  deliveryManId: z.string().uuid('Invalid Delivery Man ID'),
  totalLoaded: z.number().int().positive('Loaded quantity must be positive'),
});

export type CreateTripDTO = z.infer<typeof CreateTripSchema>;





export const EndTripSchema = z.object({
  actualRemaining: z.number().int().nonnegative(),
});