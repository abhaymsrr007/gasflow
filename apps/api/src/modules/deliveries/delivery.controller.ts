import { Request, Response } from 'express';
import { DeliveryService } from './delivery.service';
import { CreateDeliverySchema } from './delivery.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiError } from '../../shared/utils/apiError';

export class DeliveryController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user?.tenantId) throw ApiError.unauthorized('Tenant context missing');

    const validatedData = CreateDeliverySchema.parse(req.body);
    const delivery = await DeliveryService.createDelivery(user.tenantId, user.userId, validatedData);

    return ApiResponse.created(res, delivery, 'Delivery completed successfully');
  });
}