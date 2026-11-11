import { Request, Response } from 'express';
import { TripService } from './trip.service';
import { CreateTripSchema } from './trip.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiError } from '../../shared/utils/apiError';

export class TripController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user?.tenantId) throw ApiError.unauthorized('Tenant context missing');

    const validatedData = CreateTripSchema.parse(req.body);
    const trip = await TripService.createTrip(user.tenantId, user.userId, validatedData);

    return ApiResponse.created(res, trip, 'Trip created successfully');
  });

  static listActive = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const trips = await TripService.listActiveTrips(user.tenantId, user.userId);

    return ApiResponse.success(res, trips, 'Active trips fetched');
  });
}