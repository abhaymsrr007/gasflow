import { z } from 'zod';

export const CreateInvoiceSchema = z.object({
  deliveryId: z.string().uuid('Invalid Delivery ID'),
});

export const RecordPaymentSchema = z.object({
//   invoiceId: z.string().uuid('Invalid Invoice ID'),
  amountPaise: z.number().int().positive('Amount must be positive'),
  paymentMethod: z.enum(['cash', 'online']),
});


export type RecordPaymentSchemaType = z.infer<typeof RecordPaymentSchema>;