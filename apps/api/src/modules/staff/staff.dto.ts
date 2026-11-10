import { z } from 'zod';

export const CreateStaffSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().length(10, 'Phone must be 10 digits').optional(),
  roleName: z.enum(['manager', 'accountant', 'driver', 'delivery_man']),
  password: z.string().min(8).optional(),
});

export type CreateStaffDTO = z.infer<typeof CreateStaffSchema>;

export const UpdateStaffSchema = z.object({
  fullName: z.string().min(2).optional(),
  phone: z.string().length(10).optional(),
  isActive: z.boolean().optional(),
});

export type UpdateStaffDTO = z.infer<typeof UpdateStaffSchema>;



export const PaginationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});

export type PaginationDTO = z.infer<typeof PaginationSchema>;