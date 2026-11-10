import { Request, Response } from 'express';
import { StaffService } from './staff.service';
import { CreateStaffSchema, PaginationSchema, UpdateStaffSchema } from './staff.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiError } from '../../shared/utils/apiError';

export class StaffController {
  // 1. Create Staff
  static create = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    
    // Ensure karo ki user ke paas tenantId hai
    if (!user || !user.tenantId) {
      throw ApiError.unauthorized('Tenant context missing');
    }

    const validatedData = CreateStaffSchema.parse(req.body);
    const staff = await StaffService.createStaff(user.tenantId, validatedData);

    return ApiResponse.created(res, staff, 'Staff member created successfully');
  });

  // 2. List Staff
  static list = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const query = PaginationSchema.parse(req.query);
    const staff = await StaffService.listStaff(user.tenantId, query);

    return ApiResponse.success(res, staff, 'Staff list fetched successfully');
  });

  // 3. Update Staff
  static update = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const staffId = req.params['id'];

    if (!staffId) throw ApiError.badRequest('Staff ID is required');

    const validatedData = UpdateStaffSchema.parse(req.body);
    const updatedStaff = await StaffService.updateStaff(user.tenantId, staffId, validatedData);

    return ApiResponse.success(res, updatedStaff, 'Staff updated successfully');
  });

  // 4. Deactivate Staff (Soft Delete)
  static deactivate = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const staffId = req.params['id'];

    if (!staffId) throw ApiError.badRequest('Staff ID is required');

    // Owner check: Sirf Owner hi kisi ko deactivate kar sakta hai
    // Note: Ye check authorize middleware mein bhi ho sakta hai, par yahan extra safety ke liye hai.
    if (user.role !== 'owner') {
      throw ApiError.forbidden('Only Owner can deactivate staff members');
    }

    await StaffService.deactivateStaff(user.tenantId, staffId);

    return ApiResponse.success(res, null, 'Staff member deactivated successfully');
  });
}