import { Request, Response } from 'express';
import { CustomerService } from './customer.service';
import { CreateCustomerSchema, UpdateCustomerSchema, CustomerQuerySchema } from './customer.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiError } from '../../shared/utils/apiError';

export class CustomerController {
    static create = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        if (!user?.tenantId) throw ApiError.unauthorized('Tenant context missing');

        const validatedData = CreateCustomerSchema.parse(req.body);
        const customer = await CustomerService.createCustomer(user.tenantId, user.id, validatedData);

        return ApiResponse.created(res, customer, 'Customer created successfully');
    });

    static list = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const query = CustomerQuerySchema.parse(req.query);

        const result = await CustomerService.listCustomers(user.tenantId, user.userId, query);

        return ApiResponse.success(res, result, 'Customers fetched successfully');
    });

    static getById = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;

        const customerId = req.params['id'];
        if (!customerId) throw ApiError.badRequest('Customer ID is required');

        const customer = await CustomerService.getCustomerById(user.tenantId, user.userId, customerId);

        return ApiResponse.success(res, customer, 'Customer fetched successfully');
    });

    static update = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;

        const customerId = req.params.id;
        if (!customerId) throw ApiError.badRequest('Customer ID is required');

        const validatedData = UpdateCustomerSchema.parse(req.body);
        const updated = await CustomerService.updateCustomer(user.tenantId, user.userId, customerId, validatedData);
        return ApiResponse.success(res, updated, 'Customer updated successfully');
    });

    static deactivate = asyncHandler(async (req: Request, res: Response) => {
        const user = (req as any).user;

        const customerId = req.params.id;
        if (!customerId) throw ApiError.badRequest('Customer ID is required');

        await CustomerService.deactivateCustomer(user.tenantId, user.userId, customerId);
        return ApiResponse.success(res, null, 'Customer deactivated successfully');
    });
}