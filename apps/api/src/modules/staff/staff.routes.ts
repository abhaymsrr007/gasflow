import { Router } from 'express';
import { StaffController } from './staff.controller';
import { requireAuth } from '../../shared/middlewares/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Add a new staff member (Manager, Accountant, Driver, Delivery Man)
 *     tags: [Staff]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, roleName]
 *             properties:
 *               fullName: { type: string }
 *               email: { type: string }
 *               phone: { type: string }
 *               roleName: { type: string, enum: [manager, accountant, driver, delivery_man] }
 *               password: { type: string }
 *     responses:
 *       201:
 *         description: Staff member created successfully
 *       403:
 *         description: Forbidden
 */
router.post('/', requireAuth, StaffController.create);

export default router;