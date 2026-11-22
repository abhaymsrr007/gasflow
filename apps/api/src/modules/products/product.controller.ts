import { Request, Response } from 'express';
import { ProductService } from './product.service';
import { CreateProductSchema } from './product.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { ApiError } from '../../shared/utils/apiError';

export class ProductController {
  static create = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    if (!user?.tenantId) throw ApiError.unauthorized('Tenant context missing');

    const data = CreateProductSchema.parse(req.body);
    const product = await ProductService.createProduct(user.tenantId, user.userId, data);

    return ApiResponse.created(res, {
      ...product,
      defaultPricePaise: product.defaultPricePaise.toString(),
      sizeKg: product.sizeKg.toString(),
    }, 'Product created successfully');
  });

  static list = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const products = await ProductService.listProducts(user.tenantId, user.userId);
    return ApiResponse.success(res, products, 'Products fetched successfully');
  });
}