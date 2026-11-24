import { Request, Response } from 'express';
import { ReportService } from './report.service';
import { ApiResponse } from '../../shared/utils/apiResponse';
import { asyncHandler } from '../../shared/utils/asyncHandler';

export class ReportController {
  static getDashboard = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const summary = await ReportService.getDashboardSummary(user.tenantId, user.userId);
    return ApiResponse.success(res, summary, 'Dashboard summary fetched');
  });

  static getDateWise = asyncHandler(async (req: Request, res: Response) => {
    const user = (req as any).user;
    const from = req.query['from'];
    const to = req.query['to'];

    // 👇 Strict string type do, aur agar undefined ho toh today's date lo
    const fromDate: string = typeof from === 'string' ? from : new Date().toISOString().split('T')[0]!;
    const toDate: string = typeof to === 'string' ? to : new Date().toISOString().split('T')[0]!;

    const report = await ReportService.getDateWiseReport(user.tenantId, user.userId, fromDate, toDate);
    return ApiResponse.success(res, report, 'Date-wise report fetched');
  });
}