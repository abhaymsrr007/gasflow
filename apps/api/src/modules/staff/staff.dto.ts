import { z } from 'zod';

export const CreateStaffSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional(), // Manager/Accountant ke liye
  phone: z.string().length(10, 'Phone must be 10 digits'), // Driver/Delivery Man ke liye
  roleName: z.enum(['manager', 'accountant', 'driver', 'delivery_man']),
  password: z.string().min(8).optional(), // System user banane ke liye
});

export type CreateStaffDTO = z.infer<typeof CreateStaffSchema>;