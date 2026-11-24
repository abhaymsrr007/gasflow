import { Request, Response } from 'express';
import { InvoiceService } from './invoice.service';
import { CreateInvoiceSchema, RecordPaymentSchema } from './invoice.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiError } from '../../shared/utils/apiError';


export class InvoiceController {
  // 1. Create from Delivery
  static createFromDelivery = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user?.tenantId) throw ApiError.unauthorized('Tenant context missing');

    const { deliveryId } = CreateInvoiceSchema.parse(req.body);
    const invoice = await InvoiceService.createFromDelivery(user.tenantId, user.userId, deliveryId);

    return ApiResponse.created(res, invoice, 'Invoice created successfully');
  });

  // 2. List Invoices
  static list = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const page = Number(req.query['page']) || 1;
    const limit = Number(req.query['limit']) || 10;
    const search = req.query['search'] as string | undefined;

    const result = await InvoiceService.listInvoices(user.tenantId, user.userId, page, limit, search);
    return ApiResponse.success(res, result, 'Invoices fetched successfully');
  });

  // 3. Get Invoice Detail
  static getById = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const invoiceId = req.params['id'];
    if (!invoiceId) throw ApiError.badRequest('Invoice ID is required');

    const invoice = await InvoiceService.getInvoiceDetail(user.tenantId, user.userId, invoiceId);
    return ApiResponse.success(res, invoice, 'Invoice details fetched');
  });

  // 4. Record Payment
  static recordPayment = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const invoiceId = req.params['id'];
    if (!invoiceId) throw ApiError.badRequest('Invoice ID is required');

    const { amountPaise, paymentMethod } = RecordPaymentSchema.parse(req.body);

    const result = await InvoiceService.recordPayment(user.tenantId, user.userId, {
      invoiceId,
      amountPaise,
      paymentMethod,
    });
    
    return ApiResponse.success(res, result, 'Payment recorded');
  });
}