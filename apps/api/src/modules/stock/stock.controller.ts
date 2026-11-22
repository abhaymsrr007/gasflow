import { Request, Response } from 'express';
import { StockService } from './stock.service';
import { StockReceiptSchema } from './stock.dto';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class StockController {
  static getStock = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const stock = await StockService.getStock(user.tenantId, user.userId);
    return ApiResponse.success(res, stock, 'Stock fetched successfully');
  });

  static stockReceipt = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const data = StockReceiptSchema.parse(req.body);
    const result = await StockService.stockReceipt(user.tenantId, user.userId, data);
    return ApiResponse.created(res, result, 'Stock receipt recorded successfully');
  });
}