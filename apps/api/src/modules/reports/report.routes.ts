import { Router } from 'express';
import { ReportController } from './report.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';

const router = Router();
router.use(requireAuth);

/**
 * @swagger
 * /api/reports/dashboard:
 *   get:
 *     summary: Get dashboard summary (Today's stats)
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Summary fetched
 */
router.get('/dashboard', ReportController.getDashboard);

/**
 * @swagger
 * /api/reports/date-wise:
 *   get:
 *     summary: Get date-wise delivery report
 *     tags: [Reports]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date }
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date }
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Date-wise report fetched
 */
router.get('/date-wise', ReportController.getDateWise);

export default router;