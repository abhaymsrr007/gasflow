import { Request, Response } from 'express';
import { StaffService } from './staff.service';
import { CreateStaffSchema } from './staff.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class StaffController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    // User JWT se aayega (requireAuth middleware)
    const user = (req as any).user;
    
    // Ensure karo ki user ke paas tenantId hai
    if (!user.tenantId) throw new Error('Tenant context missing');

    const validatedData = CreateStaffSchema.parse(req.body);
    const staff = await StaffService.createStaff(user.tenantId, validatedData);

    return ApiResponse.created(res, staff, 'Staff member created successfully');
  });
}