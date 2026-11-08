import { z } from 'zod';

export const SignupSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  agencyName: z.string().min(2, 'Agency name is required')
});

export type SignupDTO = z.infer<typeof SignupSchema>;

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string(),
});

export type LoginDTO = z.infer<typeof LoginSchema>;

export interface AuthResponseData {
  userId: string;
}