import { z } from 'zod';

// Customer Create karne ka schema
export const CreateCustomerSchema = z.object({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  contactPerson: z.string().optional(),
  phone: z.string().length(10, 'Phone must be exactly 10 digits'),
  category: z.enum(['restaurant', 'hotel', 'dhaba', 'cafe', 'caterer', 'other']),
  creditLimitPaise: z.number().int().nonnegative().default(0),
  openingBalancePaise: z.number().int().default(0),
});

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;

// Customer Update karne ka schema (Sab optional)
export const UpdateCustomerSchema = CreateCustomerSchema.partial();

export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;

// Pagination aur Search
export const CustomerQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
});

export type CustomerQueryDTO = z.infer<typeof CustomerQuerySchema>;